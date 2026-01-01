// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
/******************************************************************************/

/**
 * @title IDiamondCut
 * @notice Interface for diamond cut functionality to add/replace/remove functions
 */
interface IDiamondCut {
    /// @notice Facet cut action types
    enum FacetCutAction {Add, Replace, Remove}
    // Add=0, Replace=1, Remove=2

    /**
     * @notice Struct representing a facet cut operation
     * @param facetAddress Address of the facet
     * @param action Type of action to perform
     * @param functionSelectors Array of function selectors
     */
    struct FacetCut {
        address facetAddress;      // Facet address
        FacetCutAction action;     // Action type
        bytes4[] functionSelectors; // Function selectors array
    }

    /// @notice Add/replace/remove any number of functions and optionally execute a function with delegatecall
    /// @dev Only the contract owner should call this function
    /// @param _diamondCut Contains the facet addresses and function selectors
    /// @param _init The address of a contract or facet to execute _calldata
    /// @param _calldata Function call, including function selector and arguments
    ///                  _calldata is executed with delegatecall on _init
    function diamondCut(
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external;

    /// @notice Emitted when diamond cut operation is performed
    event DiamondCut(FacetCut[] _diamondCut, address _init, bytes _calldata);
}
