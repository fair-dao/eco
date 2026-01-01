// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ERC-173 Contract Ownership Standard
 * @notice Standard interface for contract ownership
 * @dev Note: The ERC-165 identifier for this interface is 0x7f5828d0
 */
interface IERC173 {
    /// @notice Emitted when ownership of the contract is transferred
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /// @notice Gets the owner address
    /// @return The address of the owner
    function owner() external view returns (address);

    /// @notice Sets the address of the new owner of the contract
    /// @dev Set _newOwner to address(0) to renounce ownership
    /// @param _newOwner The address of the new owner
    function transferOwnership(address _newOwner) external;
}
