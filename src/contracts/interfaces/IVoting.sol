// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

/**
 * @title IVoting
 * @dev Voting interface contract for vote counting and total votes management
 * @notice This interface defines basic methods for getting user votes and total votes
 */
interface IVoting {
    /**
     * @dev Gets the number of votes a user has
     * @param user Address of the user to query
     * @return votes Number of votes the user currently has
     */
    function getUserVotes(address user) external view returns (uint256 votes);
    
    /**
     * @dev Gets the total number of all votes
     * @return totalVotes Total number of votes available for voting
     */
    function getAllVotes() external view returns (uint256 totalVotes);
}