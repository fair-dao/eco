// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamond Standard: https://eips.ethereum.org/EIPS/eip-2535
/******************************************************************************/

/**
 * @title IDiamondLoupe
 * @notice Interface for diamond loupe functionality to observe the diamond contract structure
 * @dev "loupe" is a small magnifying glass used to observe diamonds.
 *      These functions are used to inspect the structure of the diamond contract.
 */
interface IDiamondLoupe {
    /// These functions are expected to be called frequently by tools.

    /**
     * @notice Facet structure
     * @param facetAddress Address of the facet
     * @param functionSelectors Array of function selectors implemented by the facet
     */
    struct Facet {
        address facetAddress;      // Facet address
        bytes4[] functionSelectors; // Function selector array
    }

    /// @notice Gets all facet addresses and their four-byte function selectors.
    /// @dev Returns an array of Facet structs containing all registered facets and their function selectors.
    /// @return Array of Facet structs
    function facets() external view returns (Facet[] memory);

    /// @notice Gets all function selectors supported by a specific facet.
    /// @dev Returns an array of function selectors associated with the provided facet address.
    /// @param _facet Facet address to query.
    /// @return Array of function selectors
    function facetFunctionSelectors(address _facet) external view returns (bytes4[] memory);

    /// @notice Gets all facet addresses used by the diamond contract.
    /// @dev Returns an array of all facet addresses currently registered in the diamond.
    /// @return Array of facet addresses
    function facetAddresses() external view returns (address[] memory);

    /// @notice Gets the facet that supports a given selector.
    /// @dev Returns address(0) if no facet is found that implements the given function selector.
    /// @param _functionSelector Function selector to query.
    /// @return Address of the facet that implements the function selector
    function facetAddress(bytes4 _functionSelector) external view returns (address);
}
