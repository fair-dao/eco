// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title IERC165
 * @notice Standard Interface Detection
 * @dev See https://eips.ethereum.org/EIPS/eip-165
 */
interface IERC165 {
    /// @notice Checks if the contract implements a specific interface
    /// @dev Interface identification is specified in ERC-165. This function
    ///  should use less than 30,000 gas.
    /// @param interfaceId The interface identifier, as specified in ERC-165
    /// @return True if the contract implements `interfaceId` and
    ///  `interfaceId` is not 0xffffffff, false otherwise
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}
