// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import "../storage/GovernanceStorage.sol"; // Import for the ProposalStatus enum
import "./IDiamondCut.sol"; // Import for the FacetCut struct

/**
 * @title IGovernanceFacet
 * @dev Interface contract for governance facet implementation
 * @notice This interface defines all external functions for the governance system
 */
interface IGovernanceFacet {
    // Events related to governance proposals
    event ProposalCreated(uint256 indexed id, address indexed proposer, address target, bytes data, string description, uint256 startBlock, uint256 endBlock);
    event VoteCast(address indexed voter, uint256 indexed proposalId, bool support, bool abstain);
    event ProposalExecuted(uint256 indexed id);
    event ProposalCanceled(uint256 indexed id);
    event ProposalStatusChanged(uint256 indexed id, GovernanceStorage.ProposalStatus oldStatus, GovernanceStorage.ProposalStatus newStatus);
    event GovernanceParametersUpdated(string paramName, uint256 oldValue, uint256 newValue);
    
    /**
     * @dev Creates a new governance proposal
     * @param target Address of the contract to call
     * @param data Calldata to execute on the target
     * @param description Description of the proposal
     * @return proposalId ID of the created proposal
     */
    function createProposal(address target, bytes calldata data, string calldata description) external returns (uint256 proposalId);
    
    /**
     * @dev Creates a new diamond cut proposal
     * @param diamondCut Array of facet cut operations
     * @param init Address of initialization contract
     * @param initCalldata Calldata for initialization function
     * @param description Description of the proposal
     * @return proposalId ID of the created diamond cut proposal
     */
    function createDiamondCutProposal(
        IDiamondCut.FacetCut[] calldata diamondCut,
        address init,
        bytes calldata initCalldata,
        string calldata description
    ) external returns (uint256 proposalId);
    
    /**
     * @dev Casts a vote on a proposal
     * @param proposalId ID of the proposal to vote on
     * @param support Boolean indicating support (true = for, false = against)
     * @param abstain Boolean indicating if the vote is an abstain vote
     */
    function castVote(uint256 proposalId, bool support, bool abstain) external;
    
    /**
     * @dev Executes a proposal that has passed
     * @param proposalId ID of the proposal to execute
     * @return success Boolean indicating if execution was successful
     * @return result Result of the execution
     */
    function executeProposal(uint256 proposalId) external returns (bool success, bytes memory result);
    
    /**
     * @dev Cancels a proposal
     * @param proposalId ID of the proposal to cancel
     */
    function cancelProposal(uint256 proposalId) external;
    
    /**
     * @dev Updates a proposal's status based on current block number
     * @param proposalId ID of the proposal to update
     */
    function updateProposalStatus(uint256 proposalId) external;
    
    /**
     * @dev Gets a proposal by ID
     * @param proposalId ID of the proposal to retrieve
     * @return proposal The proposal struct
     */
    function getProposal(uint256 proposalId) external view returns (GovernanceStorage.Proposal memory proposal);
    
    /**
     * @dev Gets the total number of proposals created
     * @return count Total number of proposals
     */
    function getProposalCount() external view returns (uint256 count);
    
    /**
     * @dev Checks if a voter has voted on a specific proposal
     * @param voter Address of the voter
     * @param proposalId ID of the proposal
     * @return hasVoted Boolean indicating if the voter has voted
     */
    function hasVoted(address voter, uint256 proposalId) external view returns (bool hasVoted);
    
    /**
     * @dev Gets the quorum numerator and denominator
     * @return numerator Quorum numerator
     * @return denominator Quorum denominator
     */
    function getQuorum() external view returns (uint256 numerator, uint256 denominator);
    
    // Governance parameter configuration functions
    /**
     * @dev Sets both minimum and maximum voting period durations in blocks in a single call
     * @param minBlocks Minimum voting period in blocks
     * @param maxBlocks Maximum voting period in blocks
     */
    function setVotingPeriodBlocks(uint256 minBlocks, uint256 maxBlocks) external;
    
    /**
     * @dev Sets the proposal threshold (minimum tokens required to create a proposal)
     * @param threshold Minimum token amount required to create a proposal
     */
    function setProposalThreshold(uint256 threshold) external;
    
    /**
     * @dev Sets the quorum requirements
     * @param numerator Numerator of the quorum fraction
     * @param denominator Denominator of the quorum fraction
     */
    function setQuorum(uint256 numerator, uint256 denominator) external;
    
    /**
     * @dev Sets the execution delay blocks
     * @param blocks Delay in blocks before a proposal can be executed after passing
     */
    function setExecutionDelayBlocks(uint256 blocks) external;
}