// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "./interfaces/IFairStakeToken.sol";
import "./interfaces/IVoting.sol"; // Import IVoting interface

/**
 * @title Fair Reward Token (FR)
 * @dev ERC20 token implementation with staking functionality, token exchange, and reward mechanisms
 * @notice Implements IVoting interface to support governance voting features
 */
contract FairStakeToken is ERC20, IFairStakeToken, IVoting, ReentrancyGuard { // Add IVoting and ReentrancyGuard to inherited interfaces
    /**
     * @dev Error definitions - Comprehensive error types for precise error handling
     */
    // Balance and amount errors
    error InsufficientBalance(uint256 required, uint256 available);
    error ZeroAmount();
    
    // Address and permission errors
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

    // Contract constants - All constants are centralized here for easy management and maintenance
    uint256 private constant PRECISION_MULTIPLIER = 10 ** 18;
    uint256 private constant MAX_TOKEN_SUPPLY = 1_000_000_000_000 * PRECISION_MULTIPLIER;
    uint256 private constant MAX_USER_STAKE = 30_000_000 * PRECISION_MULTIPLIER;
    uint256 private constant SECONDS_PER_DAY = 1 days;
    uint256 private constant SECONDS_PER_WEEK = SECONDS_PER_DAY * 7;
    uint256 private constant MAX_STAKE_DURATION = SECONDS_PER_DAY * 180;    
    uint256 private constant BASE_REWARD_RATE = 10000 * PRECISION_MULTIPLIER;
    
    // Immutable addresses (set during construction)
    IERC20 public immutable stakedToken; // Token that users stake to earn rewards
    address public owner; // Ethereum standard contract owner
    
    // Contract operation state
    bool public paused;
    
    // Function module enumeration for granular pause control
    enum FunctionModule {
        STAKE,
        UNSTAKE,
        REWARD,
        EXCHANGE,
        BURN
    }
    
    // Mapping to store pause state for each function module
    mapping(FunctionModule => bool) public pausedModules;
    
    // Core contract state variables
    uint256 public totalStaked;
    uint256 public totalUnstaking;

    // Token transfer type enum
    enum TokenTransferType {
        STANDARD,
        NON_STANDARD,
        TRX
    }

    // Optimized storage layout for token exchange information
    struct TokenExchangeInfo {
        uint256 remainingExchangeAmount;
        uint88 rateNumerator;
        uint88 rateDenominator;
        uint64 startTime;
        uint8 exchangeDurationWeeks;
        uint8 transferType;
    }
    
    // Token exchange details mapping
    mapping(address => TokenExchangeInfo) public tokenExchangeInfo;
        
    // Core data structure for tracking user staking positions
    struct StakeInfo {
        uint256 amount;
        uint256 unstakeRequestAmount;
        uint64 startTime;
        uint64 lastClaimed;
        uint64 unstakeRequestTime;
        uint64 unstakeWaitDays;
    }
    
    mapping(address => StakeInfo) private stakes;
    
    // Events
    event Paused(address indexed operator);
    event Unpaused(address indexed operator);
    event ModulePaused(FunctionModule indexed module, address indexed operator);
    event ModuleUnpaused(FunctionModule indexed module, address indexed operator);
    event Staked(address indexed user, uint256 fairAmount,uint256 rate);
    event UnstakeRequested(address indexed user, uint256 fairAmount, uint64 waitDays,uint256 rate);
    event Unstaked(address indexed user, uint256 fairAmount, uint256 fee);
    event RewardClaimed(address indexed user, uint256 frAmount);
    event Burnt(address indexed user, uint256 frAmount);
    event TokenExchangeRateSet(address indexed tokenAddress, uint88 rateNumerator, uint88 rateDenominator, uint256 maxExchangeAmount);
    event TokenExchanged(address indexed user, address indexed tokenAddress, uint256 frAmount, uint256 exchangeTokenAmount);
    event ContributorRewardMinted(address indexed contributor, uint256 indexed proposalId, uint256 frAmount, string description,address operator);

    // Custom mint function to enforce maximum supply limit
    function _customMint(address account, uint256 amount) internal {
        uint256 newSupply = totalSupply() + amount;
        if (newSupply > MAX_TOKEN_SUPPLY) {
            revert ExceedsMaxSupply(amount, MAX_TOKEN_SUPPLY, totalSupply());
        }
        
        super._mint(account, amount);
    }
    
    // Mint Fair Reward Token (FR) as rewards for contributors
    function mintContributorReward(
        address contributor,
        uint256 proposalId,
        uint256 amount,
        string calldata description
    ) external isOwner returns(bool)
    {
        if (contributor == address(0)) revert InvalidAddress();
        if (amount <= 0) revert ZeroAmount();
        
        _customMint(contributor, amount);
        
        emit ContributorRewardMinted(contributor, proposalId, amount, description, msg.sender);
        
        return true;
    }
    
    // Initializes the Fair Reward Token (FR) contract
    constructor(address _stakedToken) ERC20("Fair Reward Token", "FR") {
        if (_stakedToken == address(0)) revert InvalidAddress();
        
        owner = msg.sender;
        stakedToken = IERC20(_stakedToken);
    }
    
    modifier isOwner() {
        if (msg.sender != owner) {
            revert NotAuthorized();
        }
        _;
    }

    modifier whenModuleNotPaused(FunctionModule module) {
        if (paused || pausedModules[module]) {
            revert PausedContract();
        }
        _;
    }
    
    function checkIsOwner(address account) external view returns(bool) {
        return account == owner;
    }
    
    function transferOwnership(address _newOwner) external isOwner {
        if (_newOwner == address(0)) revert InvalidAddress();
        owner = _newOwner;
    }
    
    function renounceOwnership() external isOwner {
        owner = address(0);
    }

    function pause() external isOwner {
        paused = true;
        emit Paused(msg.sender);
    }
    
    function unpause() external isOwner {
        paused = false;
        emit Unpaused(msg.sender);
    }
    
    function pauseModule(uint8 module) external isOwner {
        pausedModules[FunctionModule(module)] = true;
        emit ModulePaused(FunctionModule(module), msg.sender);
    }
    
    function unpauseModule(uint8 module) external isOwner {
        pausedModules[FunctionModule(module)] = false;
        emit ModuleUnpaused(FunctionModule(module), msg.sender);      
    }
    
    // Set exchange rate for a token
    function setTokenExchangeRate(address tokenAddress, uint88 rateNumerator, uint88 rateDenominator, uint256 maxExchangeAmount, uint8 transferType, uint8 durationWeeks) external isOwner returns(bool) {
        if (tokenAddress == address(0) || tokenAddress == address(this)) revert InvalidAddress();
        if (maxExchangeAmount <= 0) revert ZeroAmount();
        if (tokenAddress != address(1) && transferType > 2) revert InvalidTransferType();
        if (rateNumerator <= 0 || rateDenominator <= 0) revert InvalidRate();
        if (durationWeeks == 0) revert ZeroAmount();

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
            transferType: tokenAddress == address(1) ? 2 : transferType
        });

        emit TokenExchangeRateSet(tokenAddress, rateNumerator, rateDenominator, maxExchangeAmount);
        return true;
    }

    // Get token exchange rate information
    function getTokenExchangeRate(address tokenAddress) external view returns (uint88 rateNumerator, uint88 rateDenominator, uint256 remainingExchangeAmount, uint8 transferType, uint8 exchangeDurationWeeks, uint64 startTime) {
        TokenExchangeInfo memory info = tokenExchangeInfo[tokenAddress];
        return (info.rateNumerator, info.rateDenominator, info.remainingExchangeAmount, info.transferType, info.exchangeDurationWeeks, info.startTime);
    }
   
    // Calculate unclaimed Fair Reward Token
    function calculateEarnedTokens(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        
        if (userStake.amount == 0) return 0;
        
        uint256 timeElapsed = block.timestamp - userStake.lastClaimed;
        
        if (timeElapsed > MAX_STAKE_DURATION) {
            timeElapsed = MAX_STAKE_DURATION;
        }
        
        uint256 rate = getRate(userStake.amount);
        
        unchecked {
            return userStake.amount * timeElapsed * rate / SECONDS_PER_DAY / 3650000;
        }
    }
    
    // Calculate stake reward rate based on staked amount
    function getRate(uint256 amount) public pure returns(uint256) {
        uint256 rate = amount / BASE_REWARD_RATE;

        rate = rate < 100 ? 100 :
               (rate <= 200 ? rate : 200 + ((rate - 200) >> 2));
        
        return rate > 500 ? 500 : rate;
    }
    
    // Stake tokens to start earning rewards
    function stake(uint256 amount) external whenModuleNotPaused(FunctionModule.STAKE) nonReentrant returns(bool) {
        if (amount == 0) {
            revert ZeroAmount();
        }        
        
        StakeInfo storage userStake = stakes[msg.sender];
        uint256 earnedTokens = calculateEarnedTokens(msg.sender);
        
        if (userStake.amount > MAX_USER_STAKE - amount) revert ExceedsMaxStake();
        
        if (!stakedToken.transferFrom(msg.sender, address(this), amount)) {
            revert TransferFailed(amount);
        }
        
        unchecked{
            totalStaked += amount;
            userStake.amount += amount;
        }
        
        userStake.lastClaimed = uint64(block.timestamp);
        
        if (userStake.startTime == 0) {
            userStake.startTime = uint64(block.timestamp);
        }
        
        if (earnedTokens > 0) {
            _customMint(msg.sender, earnedTokens);
            emit RewardClaimed(msg.sender, earnedTokens);
        }
        uint256 rate = getRate(userStake.amount);
        emit Staked(msg.sender, amount,rate);
        return true;
    }
    
    // Request to unstake tokens
    function requestUnstake(uint256 amount, uint64 waitDays) external whenModuleNotPaused(FunctionModule.UNSTAKE) nonReentrant returns(bool) {
        StakeInfo storage userStake = stakes[msg.sender];
        
        if (amount == 0) {
            revert ZeroAmount();
        }
        
        if (userStake.amount < amount) {
            revert InsufficientBalance(amount, userStake.amount);
        }
        
        if (waitDays < 15) {
            waitDays = 15;
        } else if (waitDays > 60) {
            waitDays = 60;
        }
        
        uint256 earnedTokens = calculateEarnedTokens(msg.sender);
        
        unchecked {
            userStake.amount -= amount;
            userStake.unstakeRequestAmount += amount;
            
            totalStaked -= amount;
            totalUnstaking += amount;
        }
        
        userStake.unstakeRequestTime = uint64(block.timestamp);
        userStake.unstakeWaitDays = waitDays;
        userStake.lastClaimed = uint64(block.timestamp);
        
        if (earnedTokens > 0) {
            _customMint(msg.sender, earnedTokens);
            emit RewardClaimed(msg.sender, earnedTokens);
        }
         uint256 rate = getRate(userStake.amount);
        emit UnstakeRequested(msg.sender, amount, waitDays,rate);
        return true;
    }
    
    // Complete unstake after specified wait period
    function unstake() external whenModuleNotPaused(FunctionModule.UNSTAKE) nonReentrant returns(bool) {
        StakeInfo storage userStake = stakes[msg.sender];
        
        uint256 amountToUnstake = userStake.unstakeRequestAmount;
        if (amountToUnstake == 0) {
            revert NoUnstakeRequest();
        }
        
        uint64 waitDays = userStake.unstakeWaitDays;
        if (waitDays == 0) {
            waitDays = 30;
        }
        
        uint256 unlockTime;
        uint256 elapsedDays;
        unchecked {
            elapsedDays = (block.timestamp - userStake.unstakeRequestTime) / SECONDS_PER_DAY;
            unlockTime = userStake.unstakeRequestTime + (waitDays * SECONDS_PER_DAY);
        }
        
        if (block.timestamp < unlockTime) {
            revert LockPeriodNotCompleted(waitDays, elapsedDays);
        }
        
        uint256 feeAmount = 0;
        uint256 amountToTransfer = amountToUnstake;
        
        if (waitDays < 60) {
            unchecked {
                uint256 daysDifference = 60 - waitDays;
                uint256 feePercentage = daysDifference * 2;
                
                feeAmount = amountToUnstake * feePercentage / 1000;
                amountToTransfer = amountToUnstake - feeAmount;
            }
        }
        
        userStake.unstakeRequestAmount = 0;
        userStake.unstakeRequestTime = 0;
        userStake.unstakeWaitDays = 0;
        
        unchecked {
            totalUnstaking -= amountToUnstake;
        }
        
        if (userStake.amount == 0) {
            userStake.startTime = 0;
        }
        
        if (!stakedToken.transfer(msg.sender, amountToTransfer)) {
            revert TransferFailed(amountToTransfer);
        }
        
        emit Unstaked(msg.sender, amountToUnstake, feeAmount);
        return true;
    }

    // Claim earned FR without unstaking
    function claimReward() external whenModuleNotPaused(FunctionModule.REWARD) nonReentrant returns(bool) {
        StakeInfo storage userStake = stakes[msg.sender];
        
        uint256 earnedTokens = calculateEarnedTokens(msg.sender);
        
        if (earnedTokens == 0) {
            revert NoTokensToClaim(msg.sender);
        }
        
        userStake.lastClaimed = uint64(block.timestamp);
        
        _customMint(msg.sender, earnedTokens);
        
        emit RewardClaimed(msg.sender, earnedTokens);
        return true;
    }   
     
    // Get user stake information
    function getUserStakeInfo(address _user) external view returns (uint256 amount, uint64 startTime, uint64 lastClaimed, uint256 unstakeRequestAmount, uint64 unstakeRequestTime,uint64 unstakeWaitDays) {
        StakeInfo memory userStake = stakes[_user];
        return (userStake.amount, userStake.startTime, userStake.lastClaimed, userStake.unstakeRequestAmount, userStake.unstakeRequestTime,userStake.unstakeWaitDays);
    }

    // Burn tokens from sender's balance
    function burn(uint256 amount) external whenModuleNotPaused(FunctionModule.BURN) nonReentrant {
        if (amount <= 0) revert ZeroAmount();
        
        _burn(msg.sender, amount);
        
        emit Burnt(msg.sender, amount);
    }
    
    // Exchange FR tokens for other tokens by burning
    function exchangeFRForToken(address tokenAddress, uint256 frAmount) external whenModuleNotPaused(FunctionModule.EXCHANGE) nonReentrant returns (uint256) {
        if (tokenAddress == address(0)) revert InvalidAddress();
        if (frAmount == 0) revert ZeroAmount();
        if (balanceOf(msg.sender) < frAmount) revert InsufficientBalance(balanceOf(msg.sender), frAmount);

        TokenExchangeInfo storage exchangeInfo = tokenExchangeInfo[tokenAddress];

        if (exchangeInfo.rateNumerator == 0 || exchangeInfo.rateDenominator == 0) revert InvalidRate();

        if (block.timestamp < exchangeInfo.startTime) revert ExchangeNotYetAvailable();

        if (exchangeInfo.exchangeDurationWeeks < type(uint8).max) {
            uint256 endTime;
            unchecked {
                endTime = exchangeInfo.startTime + (uint256(exchangeInfo.exchangeDurationWeeks) * SECONDS_PER_WEEK);
            }
            if (block.timestamp > endTime) revert ExchangeExpired();
        }

        uint256 numerator;
        unchecked {
            numerator = frAmount * exchangeInfo.rateNumerator;
        }

        uint256 exchangeAmount;
        unchecked {
            exchangeAmount = numerator / exchangeInfo.rateDenominator;
        }

        if (exchangeAmount == 0) revert ZeroAmount();

        if (exchangeAmount > exchangeInfo.remainingExchangeAmount) revert ExceedsExchangeLimit(exchangeAmount, exchangeInfo.remainingExchangeAmount);

        uint256 fortyEightHoursInSeconds = 48 * 60 * 60;
        if (block.timestamp <= exchangeInfo.startTime + fortyEightHoursInSeconds) {
            uint256 maxExchangePerTransaction = exchangeInfo.remainingExchangeAmount / 100;
            if (exchangeAmount > maxExchangePerTransaction) {
                revert ExchangeAmountExceedsOnePercentLimit(exchangeAmount, maxExchangePerTransaction);
            }
        }

        unchecked {
            exchangeInfo.remainingExchangeAmount -= exchangeAmount;
        }

        _burn(msg.sender, frAmount);

        if (exchangeInfo.transferType == 2) {
            (bool success,) = payable(msg.sender).call{value: exchangeAmount}('');
            if (!success) revert TransferFailed(exchangeAmount);

            emit TokenExchanged(msg.sender, tokenAddress, frAmount, exchangeAmount);
        } else {
            (bool success, bytes memory returnData) = tokenAddress.call(abi.encodeWithSignature("transfer(address,uint256)", msg.sender, exchangeAmount));
            if (!success) revert TransferFailed(exchangeAmount);
            if (exchangeInfo.transferType == 0) {
                if (returnData.length != 32) revert InvalidReturnDataLength(32, returnData.length);
                bool transferSuccess = abi.decode(returnData, (bool));
                if (!transferSuccess) revert TransferFailed(exchangeAmount);
            }

            emit TokenExchanged(msg.sender, tokenAddress, frAmount, exchangeAmount);
        }

        return exchangeAmount;
    }

    // Returns the number of decimals
    function decimals() public view virtual override returns (uint8) {
        return 18;
    }

    // ========================= IVoting Interface Implementation =========================

    /**
     * @dev Gets the number of votes a user has
     * @param user Address of the user to query
     * @return votes Number of votes the user currently has (using staked amount as voting power)
     */
    function getUserVotes(address user) external view override returns (uint256 votes) {
        return stakes[user].amount; // Voting power is based on the amount a user has staked
    }

    /**
     * @dev Gets the total number of all votes
     * @return totalVotes Total number of votes available for voting (using total staked amount)
     */
    function getAllVotes() external view override returns (uint256 totalVotes) {
        return totalStaked; // Total available votes equals total amount of tokens staked
    }
}