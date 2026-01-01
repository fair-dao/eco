// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
* 
* Gas optimized implementation of DiamondLoupeFacet.
/******************************************************************************/

import { LibDiamond } from "../libraries/LibDiamond.sol";
import { IDiamondLoupe } from "../interfaces/IDiamondLoupe.sol";
import { IERC165 } from "../interfaces/IERC165.sol";

// Functions from DiamondLoupeFacet must be added to a Diamond.
// EIP-2535 Diamond standard requires these functions.

contract DiamondLoupeFacet is IDiamondLoupe, IERC165 {
    // Diamond Loupe functions
    ////////////////////////////////////////////////////////////////////
    /// These functions are expected to be called frequently by tools.
    //
    // struct Facet {
    //     address facetAddress;
    //     bytes4[] functionSelectors;
    // }

    /// @notice Gets all facets and their selectors.
    /// @dev Returns an array of Facet structs, each containing a facet address and its function selectors.
    /// @return Array of Facet structs
    function facets() external override view returns (Facet[] memory) {
        // Gas optimization: Cache diamond storage
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        uint256 numFacets = ds.facetAddresses.length;
        Facet[] memory facetArray = new Facet[](numFacets);
        
        // Gas optimization: Use unchecked for loop increment
        unchecked {
            for (uint256 i; i < numFacets; i++) {
                address facetAddr = ds.facetAddresses[i];
                facetArray[i].facetAddress = facetAddr;
                facetArray[i].functionSelectors = ds.facetFunctionSelectors[facetAddr].functionSelectors;
            }
        }
        return facetArray;
    }

    /// @notice Gets all function selectors provided by a facet.
    /// @dev Returns an array of function selectors associated with the given facet address.
    /// @param _facet Address of the facet.
    /// @return Array of function selectors
    function facetFunctionSelectors(address _facet) external override view returns (bytes4[] memory) {
        // Direct access to storage without caching since it's a single access
        return LibDiamond.diamondStorage().facetFunctionSelectors[_facet].functionSelectors;
    }

    /// @notice Gets all facet addresses used by a diamond.
    /// @dev Returns an array of all facet addresses currently registered in the diamond.
    /// @return Array of facet addresses
    function facetAddresses() external override view returns (address[] memory) {
        // Direct access to storage without caching since it's a single access
        return LibDiamond.diamondStorage().facetAddresses;
    }

    /// @notice Gets the facet that supports the given selector.
    /// @dev Returns address(0) if no facet is found that supports the given selector.
    /// @param _functionSelector Function selector.
    /// @return Address of the facet
    function facetAddress(bytes4 _functionSelector) external override view returns (address) {
        // Direct access to storage without caching since it's a single access
        return LibDiamond.diamondStorage().selectorToFacetAndPosition[_functionSelector].facetAddress;
    }

    /// @notice ERC-165 implementation
    /// @dev Checks if the contract implements a given interface.
    /// @param _interfaceId The interface identifier, as specified in ERC-165.
    /// @return True if the contract implements _interfaceId, false otherwise.
    function supportsInterface(bytes4 _interfaceId) external override view returns (bool) {
        // Gas optimization: Cache the frequently accessed interfaces
        if (_interfaceId == type(IDiamondLoupe).interfaceId || 
            _interfaceId == type(IERC165).interfaceId) {
            return true;
        }
        // Check for other supported interfaces
        return LibDiamond.diamondStorage().supportedInterfaces[_interfaceId];
    }
}
