// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import { LibDiamond } from "../libraries/LibDiamond.sol";
import { IERC173 } from "../interfaces/IERC173.sol";

// Ownership facet contract, implementing EIP-173 contract ownership standard
contract OwnershipFacet is IERC173 {
    /// @notice Transfers ownership of the diamond contract
    /// @dev Only the current owner can call this function
    /// @param _newOwner The address of the new owner
    function transferOwnership(address _newOwner) external override {
        LibDiamond.enforceIsContractOwner();
        LibDiamond.setContractOwner(_newOwner);
    }

    /// @notice Gets the current owner of the diamond contract
    /// @dev Returns the address of the current contract owner
    /// @return The address of the owner
    function owner() external override view returns (address) {
        return LibDiamond.contractOwner();
    }
}
