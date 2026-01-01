// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

interface IFairStakeToken {
    error InvalidAddress();
    error ExchangeAmountExceedsOnePercentLimit(uint256 requested, uint256 maxAllowed);
    error InvalidTransferType();
    error ExceedsMaxSupply(uint256 requested, uint256 maxSupply, uint256 currentSupply);

    // Owner Management Functions
    function transferOwnership(address _newOwner) external;
    function renounceOwnership() external;
    function checkIsOwner(address account) external view returns (bool);

    // Pause Control Functions
    function pause() external;
    function unpause() external;
    function pauseModule(uint8 module) external;
    function unpauseModule(uint8 module) external;

    // Exchange Rate Configuration
    function setTokenExchangeRate(
        address tokenAddress,
        uint88 rateNumerator,
        uint88 rateDenominator,
        uint256 maxExchangeAmount,
        uint8 transferType,
        uint8 durationWeeks
    ) external returns (bool);

    // Contributor Reward Minting
    function mintContributorReward(
        address contributor,
        uint256 proposalId,
        uint256 amount,
        string calldata description
    ) external returns (bool);

    // View Functions
    function totalStaked() external view returns (uint256);
    function totalUnstaking() external view returns (uint256);
    function getTokenExchangeRate(address tokenAddress) external view returns (uint88 rateNumerator, uint88 rateDenominator, uint256 remainingExchangeAmount, uint8 transferType, uint8 exchangeDurationWeeks, uint64 startTime);
    
    // Public Functions
    function stake(uint256 amount) external returns (bool);
    function requestUnstake(uint256 amount, uint64 waitDays) external returns (bool);
    function unstake() external returns (bool);
    function claimReward() external returns (bool);
    function burn(uint256 amount) external;
    function exchangeFRForToken(address tokenAddress, uint256 frAmount) external returns (uint256);

    
}