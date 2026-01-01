// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamonds: https://eips.ethereum.org/EIPS/eip-2535
*
* Diamond implementation with gas optimizations.
/******************************************************************************/

import { LibDiamond } from "./libraries/LibDiamond.sol";
import { IDiamondCut } from "./interfaces/IDiamondCut.sol";

// Gas optimization: Use custom errors instead of require with strings
error FunctionNotFound(bytes4 selector);
error OwnerZeroAddress();
error DiamondCutFacetZeroAddress();
error FacetCutsAlreadyExist();

contract Diamond {    

    constructor() payable {        
        // Set contract owner to deployer
        LibDiamond.setContractOwner(tx.origin);
    }


    function setDiamondCutFacet(
        IDiamondCut.FacetCut[] calldata _diamondCut,
        address _init,
        bytes calldata _calldata) external {
        LibDiamond.enforceIsContractOwner();
        // Ensure no existing facet cuts before adding the diamondCut function
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        if (ds.facetAddresses.length != 0) revert FacetCutsAlreadyExist();        
        LibDiamond.diamondCut(_diamondCut, _init, _calldata);
    }


    // Finds facet for function and executes the function if found.
    fallback() external payable {
        // Get diamond storage
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        
        // Get function selector from calldata
        bytes4 selector = msg.sig;
        
        // Get facet address for selector
        address facet = ds.selectorToFacetAndPosition[selector].facetAddress;
        
        // Revert if facet not found
        if (facet == address(0)) {
            revert FunctionNotFound(selector);
        }
        
        // Execute function using assembly
        assembly {
            // Copy calldata to memory
            calldatacopy(0, 0, calldatasize())
            
            // Delegatecall to facet
            let result := delegatecall(gas(), facet, 0, calldatasize(), 0, 0)
            
            // Get and handle return data
            let retSize := returndatasize()
            returndatacopy(0, 0, retSize)
            
            // Forward result or revert
            switch result
            case 0 {
                revert(0, retSize)
            }
            default {
                return(0, retSize)
            }
        }
    }

    // Gas optimization: Explicitly define empty receive function
    receive() external payable {}
}
