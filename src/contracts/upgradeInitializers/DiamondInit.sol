// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamond Standard: https://eips.ethereum.org/EIPS/eip-2535
*
* Diamond initialization contract.
/******************************************************************************/

import {LibDiamond} from "../libraries/LibDiamond.sol";
import { IDiamondLoupe } from "../interfaces/IDiamondLoupe.sol";
import { IDiamondCut } from "../interfaces/IDiamondCut.sol";
import { IERC173 } from "../interfaces/IERC173.sol";
import { IERC165 } from "../interfaces/IERC165.sol";

/// @title DiamondInit - Diamond initialization contract
/// @notice This contract initializes a diamond upon deployment or upgrade
/// @dev Customize this contract as needed for your specific diamond implementation

contract DiamondInit {    

    /// @notice Initializes the diamond's state variables
    /// @dev This function is called via delegatecall during diamond deployment or upgrade
    /// @dev Add parameters to this function as needed to set your own state variables
    function init() external {
        // Register supported interfaces for ERC-165
        LibDiamond.DiamondStorage storage ds = LibDiamond.diamondStorage();
        ds.supportedInterfaces[type(IERC165).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondCut).interfaceId] = true;
        ds.supportedInterfaces[type(IDiamondLoupe).interfaceId] = true;
        ds.supportedInterfaces[type(IERC173).interfaceId] = true;

        // Add your own state variables here
        // EIP-2535 specifies that the `diamondCut` function accepts two optional parameters:
        // address _init and bytes calldata _calldata
        // These parameters are used to execute an arbitrary function via delegatecall
        // to set state variables in the diamond during deployment or upgrade
        // More info: https://eips.ethereum.org/EIPS/eip-2535#diamond-interface 
    }


}
