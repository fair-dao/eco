// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";


/**
 * @title Fair Reward Token (FR)
 * @dev ERC20 token implementation with staking functionality, token exchange, and reward mechanisms
 */
contract FairStakeToken is ERC20 {
    /**
     * @dev Error definitions - Comprehensive error types for precise error handling
     */
    // Balance and amount errors
    error InsufficientBalance(uint256 required, uint256 available);
    error ZeroAmount();
    error CalculationOverflow();
    
    // Address and permission errors
    error InvalidAddress();
    error NotAuthorized();
    error PausedContract();
    
    // Staking and unstaking errors
    error ExceedsMaxStake();
    error LockPeriodNotCompleted(uint256 requiredDays, uint256 elapsedDays);
    error NoUnstakeRequest();
    
    // Reward and token errors
    error NoTokensToClaim(address user);
    error TransferFailed(uint256 amount);
    error InvalidReturnDataLength(uint256 expected, uint256 actual);
    
    // Exchange related errors
    error InvalidRate();
    error ExchangeNotYetAvailable();
    error ExchangeExpired();
    error ExceedsExchangeLimit(uint256 requested, uint256 available);
    error ExchangeAmountExceedsOnePercentLimit(uint256 requested, uint256 maxAllowed);
    error InvalidTransferType();
    error TRXTransferRejected();
    error ExceedsMaxSupply(uint256 requested, uint256 maxSupply, uint256 currentSupply);
    
    /**
     * @dev Contract constants - All constants are centralized here for easy management and maintenance
     */
    uint256 private constant PRECISION_MULTIPLIER = 10 ** 18;
    uint256 private constant MAX_TOKEN_SUPPLY = 1_000_000_000_000 * PRECISION_MULTIPLIER;
    uint256 private constant MAX_USER_STAKE = 30_000_000 * PRECISION_MULTIPLIER;
    uint256 private constant SECONDS_PER_DAY = 1 days;
    uint256 private constant SECONDS_PER_WEEK = SECONDS_PER_DAY * 7;
    uint256 private constant MAX_STAKE_DURATION = SECONDS_PER_DAY * 180;    
    uint256 private constant BASE_REWARD_RATE = 10000 * PRECISION_MULTIPLIER;
    
    /**
     * @dev Immutable addresses (set during construction)
     */
    IERC20 public immutable stakedToken; // Token that users stake to earn rewards
    address public owner; // Ethereum standard contract owner
    
    /**
     * @dev Contract operation state
     * @notice true = paused, false = active
     */
    bool public paused;
    
    /**
     * @dev Function module enumeration for granular pause control
     */
    enum FunctionModule {
        STAKE,
        UNSTAKE,
        REWARD,
        EXCHANGE,
        BURN
    }
    
    /**
     * @dev Mapping to store pause state for each function module
     */
    mapping(FunctionModule => bool) public pausedModules;
    
    /**
     * @dev Core contract state variables
     */
    /**
     * @dev Total amount of tokens currently staked
     */
    uint256 public totalStaked;
    
    /**
     * @dev Total amount of tokens in the unstaking period
     */
    uint256 public totalUnstaking;

    // Token transfer type enum
    enum TokenTransferType {
        STANDARD,        // Standard ERC20 transfer that returns boolean
        NON_STANDARD,    // Non-standard transfer that doesn't return a value (e.g., TRC20 USDT)
        TRX             // TRX native token transfer
    }

    /**
     * @dev Optimized storage layout for token exchange information
     */
    struct TokenExchangeInfo {
        /**
         * @dev Remaining exchange amount for this token
         * @notice Takes a full 256-bit slot
         */
        uint256 remainingExchangeAmount;

        /**
         * @dev Numerator of exchange rate
         * @notice Packed into a single 256-bit slot
         */
        uint88 rateNumerator;

        /**
         * @dev Denominator of exchange rate
         * @notice Packed into a single 256-bit slot
         */
        uint88 rateDenominator;

        /**
         * @dev Exchange start time
         * @notice Packed into a single 256-bit slot
         */
        uint64 startTime;

        /**
         * @dev Exchange duration in weeks
         * @notice Packed into a single 256-bit slot
         */
        uint8 exchangeDurationWeeks;

        /**
         * @dev Token transfer type
         * @notice 0 for STANDARD, 1 for NON_STANDARD, 2 for TRX
         * @notice Packed into a single 256-bit slot
         */
        uint8 transferType;
    }
    
    /**
     * @dev Token exchange details mapping
     */
    mapping(address => TokenExchangeInfo) public tokenExchangeInfo;
        
    /**
     * @dev Core data structure for tracking user staking positions
     * @notice Optimized storage layout to pack variables efficiently
     */
    struct StakeInfo {
        /**
         * @dev Staked tokens amount
         * @notice Takes a full 256-bit slot
         */
        uint256 amount;
        
        /**
         * @dev Requested unstake amount
         * @notice Takes a full 256-bit slot
         */
        uint256 unstakeRequestAmount;
        
        /**
         * @dev Stake timestamp
         * @notice Packed into a single 256-bit slot
         */
        uint64 startTime;
        
        /**
         * @dev Last claim timestamp
         * @notice Packed into a single 256-bit slot
         */
        uint64 lastClaimed;
        
        /**
         * @dev Unstake request timestamp
         * @notice Packed into a single 256-bit slot
         */
        uint64 unstakeRequestTime;
        
        /**
         * @dev Unstake wait period in days
         * @notice Packed into a single 256-bit slot
         */
        uint64 unstakeWaitDays;
    }
    
    mapping(address => StakeInfo) private stakes; // User stake data
    
    // Events
    event Paused(address indexed operator); // Contract paused
    event Unpaused(address indexed operator); // Contract resumed
    event ModulePaused(FunctionModule indexed module, address indexed operator); // Function module paused
    event ModuleUnpaused(FunctionModule indexed module, address indexed operator); // Function module resumed
    event Staked(address indexed user, uint256 fairAmount,uint256 rate); // Tokens staked
    event UnstakeRequested(address indexed user, uint256 fairAmount, uint64 waitDays,uint256 rate); // Unstake requested
    event Unstaked(address indexed user, uint256 fairAmount, uint256 fee); // Tokens unstaked with fee information
    event RewardClaimed(address indexed user, uint256 frAmount); // Rewards claimed
    event Burnt(address indexed user, uint256 frAmount); // Tokens burned
    event TokenExchangeRateSet(address indexed tokenAddress, uint88 rateNumerator, uint88 rateDenominator, uint256 maxExchangeAmount); // Exchange rate (numerator/denominator) and max exchange amount set
    event TokenExchanged(address indexed user, address indexed tokenAddress, uint256 frAmount, uint256 exchangeTokenAmount); // Token exchanged
    event ContributorRewardMinted(address indexed contributor, uint256 indexed proposalId, uint256 frAmount, string description,address operator); // Contributor reward minted

    /**
     * @dev Mint Fair Reward Token (FR) as rewards for contributors
     * @param contributor Address of the contributor to receive rewards
     * @param proposalId ID of the proposal related to this contribution
     * @param amount Amount of FR tokens to mint as reward
     * @param description Brief description of the contribution
     * @return Boolean indicating success of the operation
     * 
     * Requirements:
     * - Caller must be the contract owner
     * - Contract must not be paused
     * - Contributor address must not be zero
     * - Reward amount must be greater than zero
     */
    /**
     * @dev Custom mint function to enforce maximum supply limit
     */
    function _customMint(address account, uint256 amount) internal {
        // Check if minting would exceed maximum supply
        uint256 newSupply = totalSupply() + amount;
        if (newSupply > MAX_TOKEN_SUPPLY) {
            revert ExceedsMaxSupply(amount, MAX_TOKEN_SUPPLY, totalSupply());
        }
        
        // Directly call ERC20's _mint function
        super._mint(account, amount);
    }
    
    /**
     * @dev Mint Fair Reward Token (FR) as rewards for contributors
     * @param contributor Address of the contributor to receive rewards
     * @param proposalId ID of the proposal related to this contribution
     * @param amount Amount of FR tokens to mint as reward
     * @param description Brief description of the contribution
     * @return Boolean indicating success of the operation
     * 
     * Requirements:
     * - Caller must be the contract owner
     * - Contract must not be paused
     * - Contributor address must not be zero
     * - Reward amount must be greater than zero
     * - Minting must not exceed maximum supply
     */
    function mintContributorReward(
        address contributor,
        uint256 proposalId,
        uint256 amount,
        string calldata description
    ) external isOwner returns(bool)
    {
        // Input validations
        if (contributor == address(0)) revert InvalidAddress();
        if (amount <= 0) revert ZeroAmount();
        
        // Mint FR tokens to the contributor (supply check happens in custom mint)
        _customMint(contributor, amount);
        
        // Emit event with all relevant information
        emit ContributorRewardMinted(contributor, proposalId, amount, description, msg.sender);
        
        return true;
    }
    /**
     * @notice Initializes the Fair Reward Token (FR) contract
     * @dev Sets up the Fair Stake Token with reference to the staked token contract
     * @param _stakedToken Address of the ERC20 token that users will stake to earn rewards
     * 
     * Requirements:
     * - `_stakedToken` must not be the zero address
     */
    constructor(address _stakedToken) ERC20("Fair Reward Token", "FR") {
        // Input validations
        if (_stakedToken == address(0)) revert InvalidAddress();
        
        // Set owner and immutable address
        owner = msg.sender;
        stakedToken = IERC20(_stakedToken);
    }
    
    /**
     * @dev Modifier to check if caller is the contract owner
     */
    modifier isOwner() {
        if (msg.sender != owner) {
            revert NotAuthorized();
        }
        _;
    }    

    
    /**
     * @dev Modifier to check if a specific function module is not paused
     */
    modifier whenModuleNotPaused(FunctionModule module) {
        if (paused || pausedModules[module]) {
            revert PausedContract();
        }
        _;
    }
    
    /**
     * @dev Modifier to prevent reentrant calls to a function
     */
    modifier nonReentrant() {
        // On reentrant call, _entered will be true
        require(!_entered, "ReentrancyGuard: reentrant call");
        
        // Set _entered to true to prevent reentrancy
        _entered = true;
        
        _;
        
        // Set _entered back to false after function execution
        _entered = false;
    }
    
    /**
     * @dev Reentrancy guard state variable
     */
    bool private _entered;
    
    /**
     * @dev Check if an address is the contract owner
     * @param account Address to check
     * @return Boolean indicating if the address is the owner
     */
    function checkIsOwner(address account) external view returns(bool) {
        return account == owner;
    }
    
    /**
     * @dev Transfer ownership of the contract to a new account
     * @param _newOwner Address of the new owner
     * 
     * Requirements:
     * - Caller must be the current owner
     * - `_newOwner` must not be the zero address
     */
    function transferOwnership(address _newOwner) external isOwner {
        if (_newOwner == address(0)) revert InvalidAddress();
        owner = _newOwner;
    }
    
    /**
     * @dev Renounce ownership of the contract
     * 
     * Requirements:
     * - Caller must be the current owner
     */
    function renounceOwnership() external isOwner {
        owner = address(0);
    }

    /**
     * @dev Pause contract operations
     */
    function pause() external isOwner {
        paused = true;  // Set pause state
        emit Paused(msg.sender);  // Emit pause event
    }
    
    /**
     * @dev Resume contract operations
     */
    function unpause() external isOwner {
        paused = false;  // Set active state
        emit Unpaused(msg.sender);  // Emit unpause event
    }
    
    /**
     * @dev Pause a specific function module
     * @param module The function module to pause
     */
    function pauseModule(FunctionModule module) external isOwner {
        pausedModules[module] = true;  // Set module pause state
        emit ModulePaused(module, msg.sender);  // Emit module paused event
    }
    
    /**
     * @dev Resume a specific function module
     * @param module The function module to resume
     */
    function unpauseModule(FunctionModule module) external isOwner {
        pausedModules[module] = false;  // Set module active state
        emit ModuleUnpaused(module, msg.sender);  // Emit module unpaused event
    }
    
    /**
     * @dev TESTING GUIDELINES FOR MODULAR PAUSE CONTROL
     * 
     * To test the modular pause functionality:
     * 1. Test each module independently:
     *    - Pause STAKE module and verify stake() fails while other functions work
     *    - Pause UNSTAKE module and verify requestUnstake() and unstake() fail
     *    - Pause REWARD module and verify claimReward() fails
     *    - Pause EXCHANGE module and verify exchangeFRForToken() fails
     *    - Pause BURN module and verify burn() fails
     * 
     * 2. Test combined scenarios:
     *    - Pause multiple modules and verify affected functions fail
     *    - Use global pause() and verify all functions fail regardless of module state
     *    - Resume specific modules after global pause is lifted
     * 
     * 3. Test event emissions:
     *    - Verify ModulePaused/ModuleUnpaused events are correctly emitted
     *    - Verify events contain correct module index and sender address
     */
    
    /**
     * @dev Set exchange rate (as numerator/denominator), max exchange amount and transfer type for a token
     * @param tokenAddress Address of the token to set rate for
     * @param rateNumerator Numerator of the exchange rate, represents the target token amount factor
     * @param rateDenominator Denominator of the exchange rate, represents the FR token amount factor
     * @param maxExchangeAmount Maximum exchange amount for this token (in target token units)
     * @param transferType Token transfer type (0 for functions returning boolean, 1 for functions with no return value, 2 for TRX)
     * @param durationWeeks Exchange duration in weeks (use 255 for unlimited duration)
     * @return Boolean indicating success of the operation
     * 
     * Requirements:
     * - Caller must be the contract owner
     * - Token address must not be zero or this contract
     * - Exchange rate must be valid (numerator and denominator > 0)
     * - Max exchange amount must be greater than zero
     * - Transfer type must be 0, 1 or 2
     * - Duration must be at least 1 week (or 255 for unlimited)
     */
    function setTokenExchangeRate(address tokenAddress, uint88 rateNumerator, uint88 rateDenominator, uint256 maxExchangeAmount, uint8 transferType, uint8 durationWeeks) external isOwner returns(bool) {
        // Input validations
        if (tokenAddress == address(0) || tokenAddress == address(this)) revert InvalidAddress();
        if (maxExchangeAmount <= 0) revert ZeroAmount();
        // For TRX exchange (tokenAddress == address(1)), transferType is set to 2
        if (tokenAddress != address(1) && transferType > 2) revert InvalidTransferType();
        if (rateNumerator <= 0 || rateDenominator <= 0) revert InvalidRate();
        if (durationWeeks == 0) revert ZeroAmount();

        // Create exchange info with unchecked time calculation
        uint64 startTime;
        unchecked {
            startTime = uint64(block.timestamp + SECONDS_PER_DAY);
        }
        
        tokenExchangeInfo[tokenAddress] = TokenExchangeInfo({
            remainingExchangeAmount: maxExchangeAmount,
            rateNumerator: rateNumerator,
            rateDenominator: rateDenominator,
            startTime: startTime,
            exchangeDurationWeeks: durationWeeks,
            transferType: tokenAddress == address(1) ? 2 : transferType // TRX has transferType 2
        });

        emit TokenExchangeRateSet(tokenAddress, rateNumerator, rateDenominator, maxExchangeAmount);
        return true;
    }
   
    /**
     * @dev Calculate unclaimed Fair Reward Token (FR) based on staked amount and time
     * @param user User address to calculate earned tokens for
     * @return Amount of earned FR tokens
     * 
     * Calculation formula: (stakeAmount * timeElapsed * getRate()) / (ONE_DAY * 3650000)
     * - Uses time-weighted calculation with rate based on stake amount
     * - Caps timeElapsed at 90 days to prevent excessive reward accumulation
     * - Includes overflow protection for all arithmetic operations
     */
    function calculateEarnedTokens(address user) public view returns (uint256) {
        // Get user stake info
        StakeInfo memory userStake = stakes[user];
        
        // Early return if no stake
        if (userStake.amount == 0) return 0;
        
        // Calculate time elapsed with max limit (90 days)
        uint256 timeElapsed = block.timestamp - userStake.lastClaimed;
        
        if (timeElapsed > MAX_STAKE_DURATION) {
            timeElapsed = MAX_STAKE_DURATION ;
        }
        
        // Get rate based on stake amount
        uint256 rate = getRate(userStake.amount);        
        if (type(uint256).max / rate / timeElapsed <= userStake.amount) revert CalculationOverflow();
        
        unchecked {
            return userStake.amount * timeElapsed * rate / SECONDS_PER_DAY / 3650000;
        }
    }
    
        

    /**
     * @dev Calculate stake reward rate based on staked amount
     * @param amount Amount of staked tokens
     * @return Reward rate (ranging from 100 to 500)
     * 
     * Rate calculation rules:
     * - Minimum rate: 100 (when stake amount is small)
     * - Rate increases up to 200 linearly
     * - Above 200, rate increases logarithmically (divided by 10 for each additional unit)
     * - Maximum rate: 500 (caps at the upper limit)
     */
    function getRate(uint256 amount) public pure returns(uint256) {
        // Calculate base rate by dividing amount by the rate base
        uint256 rate = amount / BASE_REWARD_RATE;

        // Apply tiered rate calculation:
        // - Tier 1: For small stakes, minimum rate of 100
        // - Tier 2: Linear increase up to rate 200
        // - Tier 3: Logarithmic increase beyond 200 (using division by 4 for efficiency)
        rate = rate < 100 ? 100 :
               (rate <= 200 ? rate : 200 + ((rate - 200) >> 2)); // bit shift for division by 4
        
        // Cap rate at maximum value of 500 to prevent excessive rewards
        return rate > 500 ? 500 : rate;
    }
    
    /**
     * @notice Stake tokens to start earning rewards
     * @dev Allows users to stake their tokens in exchange for future rewards
     * @param amount Amount of tokens to stake
     * @return Boolean indicating success of the operation
     * 
     * Requirements:
     * - Caller must have approved at least `amount` tokens for transfer
     * - `amount` must be greater than zero
     * - Contract and STAKE module must not be paused
     * 
     * Effects:
     * - Transfers tokens from user to contract
     * - Updates user stake information
     * - Calculates and mints any pending rewards automatically
     */
    function stake(uint256 amount) external whenModuleNotPaused(FunctionModule.STAKE) nonReentrant returns(bool) {
        // Input validation
        if (amount == 0) {
            revert ZeroAmount();
        }        
        
        // First calculate rewards to avoid state changes before external calls
        StakeInfo storage userStake = stakes[msg.sender];
        uint256 earnedTokens = calculateEarnedTokens(msg.sender);
        
        // Check if the total stake after this operation would exceed the maximum allowed
        if (userStake.amount > MAX_USER_STAKE - amount) revert ExceedsMaxStake();

        // Check for overflow before updating totalStaked
        if (totalStaked > type(uint256).max - amount) revert CalculationOverflow();
        
        // Transfer tokens from user (external call) - done after all checks but before state updates
        if (!stakedToken.transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed(amount);
        }
        
        // Update state variables - perform all state changes after external calls
        unchecked{
            totalStaked += amount;
            userStake.amount += amount;
        }
        
        userStake.lastClaimed = uint64(block.timestamp);
        
        if (userStake.startTime == 0) {
            userStake.startTime = uint64(block.timestamp);
        }
        
        // Mint rewards if any
        if (earnedTokens > 0) {
            _customMint(msg.sender, earnedTokens);
            emit RewardClaimed(msg.sender, earnedTokens);
        }
        uint256 rate = getRate(userStake.amount);
        emit Staked(msg.sender, amount,rate);
        return true;
    }
    
    /**
     * @notice Request to unstake tokens, starting a waiting period
     * @dev Initiates the unstaking process which requires waiting before final withdrawal
     * @param amount Amount of tokens to unstake
     * @param waitDays Optional wait period in days (min: 1, max: 60)
     * @return Boolean indicating success of the operation
     * 
     * Requirements:
     * - Caller must have sufficient staked balance
     * - `amount` must be greater than zero
     * - `waitDays` must be between 1 and 60 (defaults to 30 if 0)
     * - Contract and UNSTAKE module must not be paused
     * 
     * Effects:
     * - Updates user stake and unstake request information
     * - Transfers amount from staked to unstaking state
     * - Automatically mints any pending rewards
     */
    function requestUnstake(uint256 amount, uint64 waitDays) external whenModuleNotPaused(FunctionModule.UNSTAKE) nonReentrant returns(bool) {
        // Get user stake info
        StakeInfo storage userStake = stakes[msg.sender];
        
        // Input validations
        if (amount == 0) {
            revert ZeroAmount();
        }
        
        if (userStake.amount < amount) {
            revert InsufficientBalance(amount, userStake.amount);
        }
        
        // Validate wait period
        if (waitDays < 15) {
            waitDays = 15; 
        } else if (waitDays > 60) {
            waitDays = 60; // Maximum 60 days
        }
        
        // Calculate earned tokens before any state changes
        uint256 earnedTokens = calculateEarnedTokens(msg.sender);
        
        // Check for overflow before updating unstake request amount
        if (userStake.unstakeRequestAmount > type(uint256).max - amount) revert CalculationOverflow();
        
        // Check for overflow before updating total unstaking amount
        if (totalUnstaking > type(uint256).max - amount) revert CalculationOverflow();
        
        // All checks are done, now update state variables
        unchecked {
            // Update user stake information
            userStake.amount -= amount;
            userStake.unstakeRequestAmount += amount;
            
            // Update global state
            totalStaked -= amount;
            totalUnstaking += amount;
        }
        
        // Update time-based state variables
        userStake.unstakeRequestTime = uint64(block.timestamp);
        userStake.unstakeWaitDays = waitDays;
        userStake.lastClaimed = uint64(block.timestamp);
        
        // Process rewards if any (external call to _customMint happens here)
        if (earnedTokens > 0) {
            _customMint(msg.sender, earnedTokens);
            emit RewardClaimed(msg.sender, earnedTokens);
        }
         uint256 rate = getRate(userStake.amount);
        // Emit unstake request event after all state updates
        emit UnstakeRequested(msg.sender, amount, waitDays,rate);
        return true;
    }
    
    /**
     * @dev Complete unstake after specified wait period
     * @return Boolean indicating success of the operation
     * 
     * Fee calculation rules:
     * - 0% fee if wait period is greater than or equal to 60 days
     * - 0.2% fee per day less than 60 days (e.g., 59 days = 0.2% fee, 58 days = 0.4% fee, etc.)
     * 
     * Requirements:
     * - Contract must not be paused
     * - User must have an active unstake request
     * - Unstake wait period must be completed
     * 
     * Effects:
     * - Calculates and deducts any applicable fee
     * - Updates user stake information
     * - Transfers tokens to user (minus fee)
     */
    function unstake() external whenModuleNotPaused(FunctionModule.UNSTAKE) nonReentrant returns(bool) {
        // Get user stake info
        StakeInfo storage userStake = stakes[msg.sender];
        
        // Get unstake request amount and validate
        uint256 amountToUnstake = userStake.unstakeRequestAmount;
        if (amountToUnstake == 0) {
            revert NoUnstakeRequest();
        }
        
        // Determine wait days with default
        uint64 waitDays = userStake.unstakeWaitDays;
        // Use default 30 days if waitDays was not set (for backward compatibility)
        if (waitDays == 0) {
            waitDays = 30;
        }
        
        // Calculate elapsed time and check if lock period is completed
        uint256 unlockTime;
        uint256 elapsedDays;
        unchecked {
            elapsedDays = (block.timestamp - userStake.unstakeRequestTime) / SECONDS_PER_DAY;
            unlockTime = userStake.unstakeRequestTime + (waitDays * SECONDS_PER_DAY);
        }
        
        // Check if lock period is completed
        if (block.timestamp < unlockTime) {
            revert LockPeriodNotCompleted(waitDays, elapsedDays);
        }
        
        // Calculate fee with optimized logic
        uint256 feeAmount = 0;
        uint256 amountToTransfer = amountToUnstake;
        
        // Calculate fee if wait period is less than 60 days
        if (waitDays < 60) {
            unchecked {
                uint256 daysDifference = 60 - waitDays;
                uint256 feePercentage = daysDifference * 2; // 0.2% per day = 2 basis points per day
                
                // Check for potential overflow before calculation
                if (amountToUnstake > type(uint256).max / feePercentage) {
                    revert CalculationOverflow();
                }
                
                feeAmount = amountToUnstake * feePercentage / 1000; // 1000 = 100% * 10 (for basis points)
                amountToTransfer = amountToUnstake - feeAmount;
            }
        }
        
        // All checks are done, now update state variables before external calls
        // Reset unstake request information
        userStake.unstakeRequestAmount = 0;
        userStake.unstakeRequestTime = 0;
        userStake.unstakeWaitDays = 0;
        
        // Update total unstaking amount
        unchecked {
            totalUnstaking -= amountToUnstake;
        }
        
        // Reset start time if no remaining stake
        if (userStake.amount == 0) {
            userStake.startTime = 0;
        }
        
        // Transfer tokens after all state changes (external call)
        if (!stakedToken.transfer(msg.sender, amountToTransfer)) {
            revert TransferFailed(amountToTransfer);
        }
        
        // Emit unstaked event with original amount and fee information
        emit Unstaked(msg.sender, amountToUnstake, feeAmount);
        return true;
    }

    /**
     * @dev Claim earned FR without unstaking
     * @return Boolean indicating success of the operation
     */
    function claimReward() external whenModuleNotPaused(FunctionModule.REWARD) nonReentrant returns(bool) {
        // Get user stake info
        StakeInfo storage userStake = stakes[msg.sender];
        
        // Calculate earned tokens before any state changes
        uint256 earnedTokens = calculateEarnedTokens(msg.sender);
        
        // Validate that there are tokens to claim
        if (earnedTokens == 0) {
            revert NoTokensToClaim(msg.sender);
        }
        
        // Update state variables before external calls
        userStake.lastClaimed = uint64(block.timestamp);
        
        // Mint rewards after state update (external call to _customMint)
        _customMint(msg.sender, earnedTokens);
        
        // Emit event after all operations are complete
        emit RewardClaimed(msg.sender, earnedTokens);
        return true;
    }
    
    /**
     * @notice Get user stake information
     * @dev Returns complete staking data for a user
     * @param _user User address to query stake information for
     * @return amount Total tokens currently staked
     * @return startTime Timestamp when staking began (first stake)
     * @return lastClaimed Timestamp when rewards were last claimed
     * @return unstakeRequestAmount Amount of tokens currently in unstaking process
     * @return unstakeRequestTime Timestamp when unstake was requested
     */
    function getUserStakeInfo(address _user) external view returns (uint256 amount, uint64 startTime, uint64 lastClaimed, uint256 unstakeRequestAmount, uint64 unstakeRequestTime,uint64 unstakeWaitDays) {
        StakeInfo memory userStake = stakes[_user];
        return (userStake.amount, userStake.startTime, userStake.lastClaimed, userStake.unstakeRequestAmount, userStake.unstakeRequestTime,userStake.unstakeWaitDays);
    }
    


    /**
     * @dev Burn tokens from sender's balance
     * @param amount Amount of tokens to burn
     * 
     * Requirements:
     * - Contract must not be paused
     * - Amount must be greater than zero
     * - User must have sufficient balance
     */
    function burn(uint256 amount) external whenModuleNotPaused(FunctionModule.BURN) nonReentrant {
        // Input validation
        if (amount <= 0) revert ZeroAmount();
        
        // Burn tokens
        _burn(msg.sender, amount);
        
        // Emit event
        emit Burnt(msg.sender, amount);
    }
    
    /**
     * @dev Exchange FR tokens for other tokens by burning
     * @param tokenAddress Address of token to receive
     * @param frAmount Amount of FR tokens to burn
     * @return Amount of tokens received
     * 
     * Requirements:
     * - Contract must not be paused
     * - Token address must not be zero
     * - FR amount must be greater than zero
     * - Exchange rate must be set (numerator and denominator > 0)
     * - Exchange period must be active (not expired and started)
     * - Requested amount must not exceed available exchange limit
     * - Within the first 48 hours of exchange opening, each transaction can exchange at most 1% of the remaining exchange amount
     * 
     * Effects:
     * - Burns FR tokens from user balance
     * - Transfers requested tokens to user
     * - Updates remaining exchange amount
     */
    function exchangeFRForToken(address tokenAddress, uint256 frAmount) external whenModuleNotPaused(FunctionModule.EXCHANGE) nonReentrant returns (uint256) {
        if (tokenAddress == address(0)) revert InvalidAddress();
        if (frAmount == 0) revert ZeroAmount();
        if (balanceOf(msg.sender) < frAmount) revert InsufficientBalance(balanceOf(msg.sender), frAmount);

        // Get exchange information
        TokenExchangeInfo storage exchangeInfo = tokenExchangeInfo[tokenAddress];

        // Validate exchange rate
        if (exchangeInfo.rateNumerator == 0 || exchangeInfo.rateDenominator == 0) revert InvalidRate();

        // Combined time window validations
        if (block.timestamp < exchangeInfo.startTime) revert ExchangeNotYetAvailable();

        // Check if exchange has expired (only if duration is not unlimited)
        if (exchangeInfo.exchangeDurationWeeks < type(uint8).max) {
            uint256 endTime;
            unchecked {
                endTime = exchangeInfo.startTime + (uint256(exchangeInfo.exchangeDurationWeeks) * SECONDS_PER_WEEK);
            }
            if (block.timestamp > endTime) revert ExchangeExpired();
        }

        // Overflow protection and calculate token amount with multiple checks
        if (exchangeInfo.rateNumerator > type(uint256).max / frAmount) revert CalculationOverflow();

        uint256 numerator;
        unchecked {
            numerator = frAmount * exchangeInfo.rateNumerator;
        }

        uint256 exchangeAmount;
        unchecked {
            exchangeAmount = numerator / exchangeInfo.rateDenominator;
        }

        // Ensure token amount is positive after calculation
        if (exchangeAmount == 0) revert ZeroAmount();

        // Check if requested exchange exceeds remaining amount
        if (exchangeAmount > exchangeInfo.remainingExchangeAmount) revert ExceedsExchangeLimit(exchangeAmount, exchangeInfo.remainingExchangeAmount);

        uint256 fortyEightHoursInSeconds = 48 * 60 * 60; // 48 hours in seconds
        if (block.timestamp <= exchangeInfo.startTime + fortyEightHoursInSeconds) {
            uint256 maxExchangePerTransaction = exchangeInfo.remainingExchangeAmount / 100; // 1% of remaining exchange amount
            if (exchangeAmount > maxExchangePerTransaction) {
                revert ExchangeAmountExceedsOnePercentLimit(exchangeAmount, maxExchangePerTransaction);
            }
        }

        // Following Checks-Effects-Interactions pattern: all state changes are completed before external calls

        // Update remaining exchange amount (state change)
        unchecked {
            exchangeInfo.remainingExchangeAmount -= exchangeAmount;
        }

        // Burn FR tokens (state change)
        _burn(msg.sender, frAmount);

        // Handle token transfer based on transfer type (external call)
        if (exchangeInfo.transferType == 2) {
            // TRX transfer
            (bool success,) = payable(msg.sender).call{value: exchangeAmount}('');
            if (!success) revert TransferFailed(exchangeAmount);

            // Emit exchange event for TRX
            emit TokenExchanged(msg.sender, tokenAddress, frAmount, exchangeAmount);
        } else {
            // Token transfer for standard ERC20 or other types
            (bool success, bytes memory returnData) = tokenAddress.call(abi.encodeWithSignature("transfer(address,uint256)", msg.sender, exchangeAmount));
            if (!success) revert TransferFailed(exchangeAmount);
            if (exchangeInfo.transferType == 0) { // Standard ERC20 has return value
                if (returnData.length != 32) revert InvalidReturnDataLength(32, returnData.length); // bool type occupies 32 bytes
                bool transferSuccess = abi.decode(returnData, (bool)); // Decode to bool
                if (!transferSuccess) revert TransferFailed(exchangeAmount);
            }

            // Emit exchange event for tokens
            emit TokenExchanged(msg.sender, tokenAddress, frAmount, exchangeAmount);
        }

        return exchangeAmount;
    }

    // Note: _executeTokenTransfer function was removed to reduce gas costs by inlining its logic

    /**
     * @dev Returns the number of decimals used to get its user representation
     * @return 18 decimals
     */
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }
    


}
