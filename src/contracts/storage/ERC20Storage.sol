// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title ERC20Storage
 * @dev Storage contract for ERC20 implementation using diamond storage pattern
 * @notice This contract defines storage variables for ERC20 functionality
 */
contract ERC20Storage {
    // Define a unique storage slot for diamond storage
    bytes32 public constant ERC20_STORAGE_POSITION = keccak256("erc20.storage");
    
    /**
     * @dev ERC20 storage structure
     * @notice All ERC20 state variables are included here for diamond pattern implementation
     */
    struct ERC20StorageStruct {
        // ERC20 token properties
        string name;
        string symbol;
        uint8 decimals;
        
        // Core ERC20 state variables
        uint256 totalSupply;
        mapping(address => uint256) balances;
        mapping(address => mapping(address => uint256)) allowances;
    }
    
    /**
     * @dev Get the diamond storage slot for ERC20
     * @return s The storage structure
     */
    function getStorage() internal pure returns (ERC20StorageStruct storage s) {
        bytes32 position = ERC20_STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}