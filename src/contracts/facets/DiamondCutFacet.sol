// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
/******************************************************************************/

import { IDiamondCut } from "../interfaces/IDiamondCut.sol";
import { LibDiamond } from "../libraries/LibDiamond.sol";
import { IGovernanceFacet } from "../interfaces/IGovernanceFacet.sol";

// Remember to add the loupe functions from DiamondLoupeFacet to the diamond contract.
// The loupe functions are required by the EIP2535 Diamond standard.

contract DiamondCutFacet is IDiamondCut {
    /// @notice Add/replace/remove any number of functions and optionally execute a function with delegatecall
    /// @dev Only the governance system can call this function
    /// @param _diamondCut Contains the facet addresses and function selectors
    /// @param _init The address of a contract or facet to execute _calldata
    /// @param _calldata Function call, including function selector and arguments
    ///                  _calldata is executed with delegatecall on _init
    function diamondCut(        
        FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata
    ) external override {
        // Only governance system can perform diamond cuts
        // For now, let's allow either the contract owner (for migration purposes)
        // or governance contract to execute cuts
        // Later, we can remove owner access once governance is fully set up
        require(
            msg.sender == LibDiamond.contractOwner() || msg.sender == address(this),
            "DiamondCut: Only contract owner or governance can perform diamond cuts"
        );
        
        LibDiamond.diamondCut(_diamondCut, _init, _calldata);
    }
}