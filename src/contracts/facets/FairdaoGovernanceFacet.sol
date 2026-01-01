// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import "../storage/GovernanceStorage.sol";
import "../interfaces/IGovernanceFacet.sol";
import "../interfaces/IFairStakeToken.sol";
import "../libraries/LibDiamond.sol";
import "../interfaces/IDiamondCut.sol";
import "../facets/GovernanceFacet.sol";

/**
 * @title Governance Facet Contract
 * @dev Implements voting governance system using diamond pattern
 * @notice This contract provides all governance functions including proposal creation, voting, and execution
 */
contract FairdaoGovernanceFacet is GovernanceFacet {  

    /**
     * @dev Creates a proposal to set token exchange rate
     * @param tokenAddress Token address
     * @param rateNumerator Exchange rate numerator
     * @param rateDenominator Exchange rate denominator
     * @param maxExchangeAmount Maximum exchange amount
     * @param transferType Transfer type
     * @param durationWeeks Exchange duration in weeks
     * @param description Proposal description
     * @return proposalId ID of the created proposal
     */
    function fairdao_CreateSetTokenExchangeRateProposal(
        address tokenAddress,
        uint88 rateNumerator,
        uint88 rateDenominator,
        uint256 maxExchangeAmount,
        uint8 transferType,
        uint8 durationWeeks,
        string calldata description
    ) external returns (uint256 proposalId) {
        GovernanceStorageStruct storage s = getStorage();
        if (s.governanceTokenAddress == address(0)) {
            revert Governance__InvalidGovernanceTokenAddress();
        }
        
        // Build call data
        bytes memory callData = abi.encodeWithSelector(
            IFairStakeToken.setTokenExchangeRate.selector,
            tokenAddress,
            rateNumerator,
            rateDenominator,
            maxExchangeAmount,
            transferType,
            durationWeeks
        );
        
        // Use internal proposal creation function
        return _createProposal(
            s.governanceTokenAddress,
            callData,
            description,
            28800
        ); //  period  1 days
    }
    
    /**
     * @dev Creates a proposal to mint contributor rewards
     * @param contributor Contributor address
     * @param amount Reward amount
     * @param descriptionOfReward Reward description
     * @param proposalDescription Proposal description
     * @return newProposalId ID of the created proposal
     * @notice The proposalIdForReward parameter will be automatically set to the newly created proposal ID
     */
    function fairdao_CreateMintContributorRewardProposal(
        address contributor,
        uint256 amount,
        string calldata descriptionOfReward,
        string calldata proposalDescription
    ) external returns (uint256 newProposalId) {
        GovernanceStorageStruct storage s = getStorage();
        if (s.governanceTokenAddress == address(0)) {
            revert Governance__InvalidGovernanceTokenAddress();
        }
        
        // Get the upcoming proposal ID
        uint256 upcomingProposalId = s.proposalCount;
        
        // Build call data, using the upcoming proposal ID as the proposalId parameter
        bytes memory callData = abi.encodeWithSelector(
            IFairStakeToken.mintContributorReward.selector,
            contributor,
            upcomingProposalId,
            amount,
            descriptionOfReward
        );
        
        // Use internal proposal creation function
        return _createProposal(
            s.governanceTokenAddress,
            callData,
            proposalDescription,
            288000
        ); // period 10 days 
    }
    
    /**
     * @dev Creates a proposal to pause the contract
     * @param description Proposal description
     * @return proposalId ID of the created proposal
     */
    function fairdao_CreatePauseProposal(
        string calldata description
    ) external returns (uint256 proposalId) {
        GovernanceStorageStruct storage s = getStorage();
        if (s.governanceTokenAddress == address(0)) {
            revert Governance__InvalidGovernanceTokenAddress();
        }
        
        // Build call data
        bytes memory callData = abi.encodeWithSelector(IFairStakeToken.pause.selector);
        
        // Use internal proposal creation function
        return _createProposal(
            s.governanceTokenAddress,
            callData,
            description,
            28800
        );
    }
    
    /**
     * @dev Creates a proposal to unpause the contract
     * @param description Proposal description
     * @return proposalId ID of the created proposal
     */
    function fairdao_CreateUnpauseProposal(
        string calldata description
    ) external returns (uint256 proposalId) {
        GovernanceStorageStruct storage s = getStorage();
        if (s.governanceTokenAddress == address(0)) {
            revert Governance__InvalidGovernanceTokenAddress();
        }
        
        // Build call data
        bytes memory callData = abi.encodeWithSelector(IFairStakeToken.unpause.selector);
        
        // Use internal proposal creation function
        return _createProposal(
            s.governanceTokenAddress,
            callData,
            description,
            28800
        );
    }
    
    /**
     * @dev Creates a proposal to pause a functional module
     * @param module Module number to pause
     * @param description Proposal description
     * @return proposalId ID of the created proposal
     */
    function fairdao_CreatePauseModuleProposal(
        uint8 module,
        string calldata description
    ) external returns (uint256 proposalId) {
        GovernanceStorageStruct storage s = getStorage();
        if (s.governanceTokenAddress == address(0)) {
            revert Governance__InvalidGovernanceTokenAddress();
        }
        
        // Build call data
        bytes memory callData = abi.encodeWithSelector(IFairStakeToken.pauseModule.selector, module);
        
        // Use internal proposal creation function
        return _createProposal(
            s.governanceTokenAddress,
            callData,
            description,
            28800
        );
    }
    
    /**
     * @dev Creates a proposal to unpause a functional module
     * @param module Module number to unpause
     * @param description Proposal description
     * @return proposalId ID of the created proposal
     */
    function fairdao_CreateUnpauseModuleProposal(
        uint8 module,
        string calldata description
    ) external returns (uint256 proposalId) {
        GovernanceStorageStruct storage s = getStorage();
        if (s.governanceTokenAddress == address(0)) {
            revert Governance__InvalidGovernanceTokenAddress();
        }
        
        // Build call data
        bytes memory callData = abi.encodeWithSelector(IFairStakeToken.unpauseModule.selector, module);
        
        // Use internal proposal creation function
        return _createProposal(
            s.governanceTokenAddress,
            callData,
            description,
            28800
        );
    }
}
