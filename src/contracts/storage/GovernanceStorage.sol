// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

/**
 * @title Governance Storage
 * @dev Storage contract for voting governance using diamond storage pattern
 * @notice This contract defines storage variables for governance functionality
 */
contract GovernanceStorage {
    // Define unique storage slot for diamond storage
    bytes32 public constant GOVERNANCE_STORAGE_POSITION = keccak256("fairdao.governance.storage");
    
    /**
     * @dev Proposal status enumeration
     * @notice Possible status values for governance proposals
     */
    enum ProposalStatus {
        Pending,     // Proposal created but voting has not started
        Active,      // Proposal is active and can receive votes
        Canceled,    // Proposal canceled by creator
        Defeated,    // Proposal did not pass
        Succeeded,   // Proposal passed but not yet executed
        Executed     // Proposal has been executed
    }
    
    /**
     * @dev Governance proposal structure
     * @notice Contains all information for a governance proposal
     */
    struct Proposal {
        // Unique identifier for the proposal
        uint256 id;
        // Address of the proposal creator
        address proposer;
        // Proposal description
        string description;
        // Target contract address to call when executing
        address target;
        // Call data to execute on the target contract
        bytes data;
        // Block number when voting starts
        uint256 startBlock;
        // Block number when voting ends
        uint256 endBlock;
        // Total votes in favor of the proposal
        uint256 forVotes;
        // Total votes against the proposal
        uint256 againstVotes;
        // Total abstain votes
        uint256 abstainVotes;
        // Status of the proposal
        ProposalStatus status;
        // Timestamp when proposal was created
        uint256 createdAt;
        // Timestamp when proposal was executed
        uint256 executedAt;
    }
    
    /**
     * @dev Voter structure
     * @notice Tracks voting information for each voter
     */
    struct Voter {
        // Indicates whether a voter has voted on a specific proposal
        mapping(uint256 => bool) hasVoted;
        // Tracks voter's choice for each proposal (true = for, false = against, abstain recorded separately)
        mapping(uint256 => bool) voteChoice;
        // Tracks voter's abstain status for each proposal
        mapping(uint256 => bool) hasAbstained;
    }
    
    /**
     * @dev Governance storage structure
     * @notice All governance state variables are included here for diamond pattern implementation
     */
    struct GovernanceStorageStruct {
        // Total number of proposals created
        uint256 proposalCount;
        // Mapping from proposal ID to Proposal structure
        mapping(uint256 => Proposal) proposals;
        // Mapping from voter address to Voter structure
        mapping(address => Voter) voters;
        // Minimum delay blocks before a passed proposal can be executed
        uint256 executionDelayBlocks;
        // Minimum number of blocks voting period must last
        uint256 minVotingPeriodBlocks;
        // Maximum number of blocks voting period can last
        uint256 maxVotingPeriodBlocks;
        // Minimum quorum requirement for proposal validity
        uint256 quorumNumerator;
        uint256 quorumDenominator;
        // Minimum token threshold required to create a proposal
        uint256 proposalThreshold;
        // Governance token contract address (for voting weight calculation and governance participation)
        address governanceTokenAddress;
    }
    
    /**
     * @dev Get the diamond storage slot for governance functionality
     * @return s Storage structure
     */
    function getStorage() internal pure returns (GovernanceStorageStruct storage s) {
        bytes32 position = GOVERNANCE_STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
