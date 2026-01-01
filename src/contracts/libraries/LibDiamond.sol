// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/******************************************************************************\
* Author: Nick Mudge <nick@perfectabstractions.com> (https://twitter.com/mudgen)
* EIP-2535 Diamond Standard: https://eips.ethereum.org/EIPS/eip-2535
* 
* Library implementing core Diamond (EIP-2535) functionality for facet management,
* ownership control, and storage management.
/******************************************************************************/
import { IDiamondCut } from "../interfaces/IDiamondCut.sol";

// Remember to add the loupe functions from DiamondLoupeFacet to a diamond.
// The loupe functions are required by the EIP2535 Diamond Standard

error InitializationFunctionReverted(address _initializationContractAddress, bytes _calldata);
error NotContractOwner();
error NotDiamondCaller();
error InvalidFacetCutAction();
error NoSelectorsInFacet();
error FacetCannotBeZero();
error FunctionAlreadyExists(bytes4);
error CannotReplaceSameFunction();
error RemoveFunctionMustBeZero();
error CannotRemoveNonExistentFunction();
error CannotRemoveImmutableFunction();
error FacetHasNoCode();
error InitHasNoCode();

library LibDiamond {
    // 32-byte keccak hash used as diamond storage position
    bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("diamond.standard.diamond.storage");

    // Facet address and position struct
    struct FacetAddressAndPosition {
        address facetAddress;
        uint96 functionSelectorPosition; // Position in facetFunctionSelectors.functionSelectors array
    }

    // Facet function selectors struct
    struct FacetFunctionSelectors {
        bytes4[] functionSelectors;
        uint256 facetAddressPosition; // Position of facet address in facetAddresses array
    }

    // Diamond storage struct
    struct DiamondStorage {
        // Maps function selector to the facet address and
        // the position of the selector in facetFunctionSelectors.selectors array
        mapping(bytes4 => FacetAddressAndPosition) selectorToFacetAndPosition;
        // Maps facet addresses to function selectors
        mapping(address => FacetFunctionSelectors) facetFunctionSelectors;
        // Facet addresses
        address[] facetAddresses;
        // Used to query if a contract implements an interface.
        // Used to implement ERC-165.
        mapping(bytes4 => bool) supportedInterfaces;
        // Contract owner
        address contractOwner;
        
    }

    // Get diamond storage
    function diamondStorage() internal pure returns (DiamondStorage storage ds) {
        // Use the constant directly in assembly
        bytes32 position = DIAMOND_STORAGE_POSITION;
        assembly {
            ds.slot := position
        }
    }

    /// @notice Emitted when contract ownership is transferred
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /// @notice Sets the new owner of the contract
    /// @param _newOwner The address of the new contract owner
    function setContractOwner(address _newOwner) internal {
        DiamondStorage storage ds = diamondStorage();
        address previousOwner = ds.contractOwner;
        ds.contractOwner = _newOwner;
        emit OwnershipTransferred(previousOwner, _newOwner);
    }

    /// @notice Returns the address of the current contract owner
    /// @return contractOwner_ The address of the current contract owner
    function contractOwner() internal view returns (address contractOwner_) {
        contractOwner_ = diamondStorage().contractOwner;
    }

    /// @notice Ensures the caller is the contract owner
    /// @dev Reverts if the caller is not the contract owner
    function enforceIsContractOwner() internal view {
        if (msg.sender != diamondStorage().contractOwner) {
            revert NotContractOwner();
        }
    }

    /// @notice Ensures the caller is the diamond contract itself
    /// @dev Reverts if the caller is not the diamond contract
    function enforceIsDiamondCaller() internal view {
        if (msg.sender != address(this)) {
            revert NotDiamondCaller();
        }
    }

    /// @notice Emitted when the diamond's facets are modified
    event DiamondCut(IDiamondCut.FacetCut[] _diamondCut, address _init, bytes _calldata);

    /// @notice Internal implementation of the diamondCut function
    /// @dev Processes an array of facet operations (add/replace/remove functions)
    /// @param _diamondCut Array of facet operations to perform
    /// @param _init Address of initialization contract
    /// @param _calldata Calldata for initialization function
    function diamondCut(
        IDiamondCut.FacetCut[] memory _diamondCut,
        address _init,
        bytes memory _calldata
    ) internal {
        uint256 len = _diamondCut.length;
        for (uint256 facetIndex; facetIndex < len; ) {
            IDiamondCut.FacetCutAction action = _diamondCut[facetIndex].action;
            if (action == IDiamondCut.FacetCutAction.Add) {
                addFunctions(_diamondCut[facetIndex].facetAddress, _diamondCut[facetIndex].functionSelectors);
            } else if (action == IDiamondCut.FacetCutAction.Replace) {
                replaceFunctions(_diamondCut[facetIndex].facetAddress, _diamondCut[facetIndex].functionSelectors);
            } else if (action == IDiamondCut.FacetCutAction.Remove) {
                removeFunctions(_diamondCut[facetIndex].facetAddress, _diamondCut[facetIndex].functionSelectors);
            } else {
                revert InvalidFacetCutAction();
            }
            unchecked { ++facetIndex; }
        }
        emit DiamondCut(_diamondCut, _init, _calldata);
        initializeDiamondCut(_init, _calldata);
    }

    /// @notice Adds new functions to the diamond
    /// @dev Reverts if selectors are empty, facet address is zero, or functions already exist
    /// @param _facetAddress Address of the facet containing the functions to add
    /// @param _functionSelectors Array of function selectors to add
    function addFunctions(address _facetAddress, bytes4[] memory _functionSelectors) internal {
        if (_functionSelectors.length == 0) {
            revert NoSelectorsInFacet();
        }
        DiamondStorage storage ds = diamondStorage();        
        if (_facetAddress == address(0)) {
            revert FacetCannotBeZero();
        }
        uint96 selectorPosition = uint96(ds.facetFunctionSelectors[_facetAddress].functionSelectors.length);
        // If facet address doesn't exist, add it
        if (selectorPosition == 0) {
            // Inline addFacet logic for gas savings
            uint256 contractSize;
            assembly {
                contractSize := extcodesize(_facetAddress)
            }
            if (contractSize == 0) {
                revert FacetHasNoCode();
            }
            ds.facetFunctionSelectors[_facetAddress].facetAddressPosition = ds.facetAddresses.length;
            ds.facetAddresses.push(_facetAddress);           
        }
        uint256 len = _functionSelectors.length;
        for (uint256 selectorIndex; selectorIndex < len; ) {
            bytes4 selector = _functionSelectors[selectorIndex];
            address oldFacetAddress = ds.selectorToFacetAndPosition[selector].facetAddress;
            if (oldFacetAddress != address(0)) {
                revert FunctionAlreadyExists(selector);
            }
            // Inline addFunction logic for gas savings
            ds.selectorToFacetAndPosition[selector].functionSelectorPosition = selectorPosition;
            ds.facetFunctionSelectors[_facetAddress].functionSelectors.push(selector);
            ds.selectorToFacetAndPosition[selector].facetAddress = _facetAddress;
            unchecked { 
                selectorPosition++; 
                selectorIndex++; 
            }
        }
    }

    /// @notice Replaces existing functions in the diamond
    /// @dev Reverts if selectors are empty, facet address is zero, or attempting to replace with same function
    /// @param _facetAddress Address of the facet containing the replacement functions
    /// @param _functionSelectors Array of function selectors to replace
    function replaceFunctions(address _facetAddress, bytes4[] memory _functionSelectors) internal {
        if (_functionSelectors.length == 0) {
            revert NoSelectorsInFacet();
        }
        DiamondStorage storage ds = diamondStorage();
        if (_facetAddress == address(0)) {
            revert FacetCannotBeZero();
        }
        uint96 selectorPosition = uint96(ds.facetFunctionSelectors[_facetAddress].functionSelectors.length);
        // If facet address doesn't exist, add it
        if (selectorPosition == 0) {
            // Inline addFacet logic for gas savings
            uint256 contractSize;
            assembly {
                contractSize := extcodesize(_facetAddress)
            }
            if (contractSize == 0) {
                revert FacetHasNoCode();
            }
            ds.facetFunctionSelectors[_facetAddress].facetAddressPosition = ds.facetAddresses.length;
            ds.facetAddresses.push(_facetAddress);
        }
        uint256 len = _functionSelectors.length;
        for (uint256 selectorIndex; selectorIndex < len; ) {
            bytes4 selector = _functionSelectors[selectorIndex];
            address oldFacetAddress = ds.selectorToFacetAndPosition[selector].facetAddress;
            if (oldFacetAddress == _facetAddress) {
                revert CannotReplaceSameFunction();
            }
            // Inline removeFunction logic for gas savings
            if (oldFacetAddress == address(0)) {
                revert CannotRemoveNonExistentFunction();
            }
            if (oldFacetAddress == address(this)) {
                revert CannotRemoveImmutableFunction();
            }
            // Replace current selector with last selector, then delete last selector
            uint256 selPosition = ds.selectorToFacetAndPosition[selector].functionSelectorPosition;
            uint256 lastSelPosition = ds.facetFunctionSelectors[oldFacetAddress].functionSelectors.length - 1;
            // Replace _selector with lastSelector if they are different
            if (selPosition != lastSelPosition) {
                bytes4 lastSelector = ds.facetFunctionSelectors[oldFacetAddress].functionSelectors[lastSelPosition];
                ds.facetFunctionSelectors[oldFacetAddress].functionSelectors[selPosition] = lastSelector;
                ds.selectorToFacetAndPosition[lastSelector].functionSelectorPosition = uint96(selPosition);
            }
            // Delete last selector
            ds.facetFunctionSelectors[oldFacetAddress].functionSelectors.pop();
            delete ds.selectorToFacetAndPosition[selector];

            // If facet address has no more selectors, delete the facet address
            if (lastSelPosition == 0) {
                // Replace current facet address with last facet address and delete last facet address
                uint256 lastFacetAddressPosition = ds.facetAddresses.length - 1;
                uint256 facetAddressPosition = ds.facetFunctionSelectors[oldFacetAddress].facetAddressPosition;
                if (facetAddressPosition != lastFacetAddressPosition) {
                    address lastFacetAddress = ds.facetAddresses[lastFacetAddressPosition];
                    ds.facetAddresses[facetAddressPosition] = lastFacetAddress;
                    ds.facetFunctionSelectors[lastFacetAddress].facetAddressPosition = facetAddressPosition;
                }
                ds.facetAddresses.pop();
                delete ds.facetFunctionSelectors[oldFacetAddress].facetAddressPosition;
            }

            // Inline addFunction logic for gas savings
            ds.selectorToFacetAndPosition[selector].functionSelectorPosition = selectorPosition;
            ds.facetFunctionSelectors[_facetAddress].functionSelectors.push(selector);
            ds.selectorToFacetAndPosition[selector].facetAddress = _facetAddress;
            
            unchecked { 
                selectorPosition++; 
                selectorIndex++; 
            }
        }
    }

    /// @notice Removes existing functions from the diamond
    /// @dev Reverts if selectors are empty, facet address is non-zero, or functions don't exist
    /// @param _facetAddress Must be address(0) as per EIP-2535 spec
    /// @param _functionSelectors Array of function selectors to remove
    function removeFunctions(address _facetAddress, bytes4[] memory _functionSelectors) internal {
        if (_functionSelectors.length == 0) {
            revert NoSelectorsInFacet();
        }
        DiamondStorage storage ds = diamondStorage();
        if (_facetAddress != address(0)) {
            revert RemoveFunctionMustBeZero();
        }
        uint256 len = _functionSelectors.length;
        for (uint256 selectorIndex; selectorIndex < len; ) {
            bytes4 selector = _functionSelectors[selectorIndex];
            address oldFacetAddress = ds.selectorToFacetAndPosition[selector].facetAddress;
            // Inline removeFunction logic for gas savings
            if (oldFacetAddress == address(0)) {
                revert CannotRemoveNonExistentFunction();
            }
            if (oldFacetAddress == address(this)) {
                revert CannotRemoveImmutableFunction();
            }
            // Replace current selector with last selector, then delete last selector
            uint256 selPosition = ds.selectorToFacetAndPosition[selector].functionSelectorPosition;
            uint256 lastSelPosition = ds.facetFunctionSelectors[oldFacetAddress].functionSelectors.length - 1;
            // Replace _selector with lastSelector if they are different
            if (selPosition != lastSelPosition) {
                bytes4 lastSelector = ds.facetFunctionSelectors[oldFacetAddress].functionSelectors[lastSelPosition];
                ds.facetFunctionSelectors[oldFacetAddress].functionSelectors[selPosition] = lastSelector;
                ds.selectorToFacetAndPosition[lastSelector].functionSelectorPosition = uint96(selPosition);
            }
            // Delete last selector
            ds.facetFunctionSelectors[oldFacetAddress].functionSelectors.pop();
            delete ds.selectorToFacetAndPosition[selector];

            // If facet address has no more selectors, delete the facet address
            if (lastSelPosition == 0) {
                // Replace current facet address with last facet address and delete last facet address
                uint256 lastFacetAddressPosition = ds.facetAddresses.length - 1;
                uint256 facetAddressPosition = ds.facetFunctionSelectors[oldFacetAddress].facetAddressPosition;
                if (facetAddressPosition != lastFacetAddressPosition) {
                    address lastFacetAddress = ds.facetAddresses[lastFacetAddressPosition];
                    ds.facetAddresses[facetAddressPosition] = lastFacetAddress;
                    ds.facetFunctionSelectors[lastFacetAddress].facetAddressPosition = facetAddressPosition;
                }
                ds.facetAddresses.pop();
                delete ds.facetFunctionSelectors[oldFacetAddress].facetAddressPosition;
            }
            unchecked { ++selectorIndex; }
        }
    }


    /// @notice Executes initialization code after a diamond cut operation
    /// @dev Uses delegatecall to execute initialization code
    /// @param _init Address of initialization contract
    /// @param _calldata Calldata for initialization function
    function initializeDiamondCut(address _init, bytes memory _calldata) internal {
        if (_init == address(0)) {
            return;
        }
        // Inline contract code check for gas savings
        uint256 contractSize;
        assembly {
            contractSize := extcodesize(_init)
        }
        if (contractSize == 0) {
            revert InitHasNoCode();
        }
        
        (bool success, bytes memory error) = _init.delegatecall(_calldata);
        if (!success) {
            if (error.length > 0) {
                // Bubble up error
                /// @solidity memory-safe-assembly
                assembly {
                    let returndata_size := mload(error)
                    revert(add(32, error), returndata_size)
                }
            } else {
                revert InitializationFunctionReverted(_init, _calldata);
            }
        }
    }
}

