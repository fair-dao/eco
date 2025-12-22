// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title FairTestToken
 * @dev Standard ERC20 token with 18 decimals precision
 */
contract FairTestToken is ERC20, Ownable {
    /**
     * @dev Constructor that gives msg.sender all of existing tokens.
     */
    constructor(uint256 initialSupply) ERC20("Fair Test Token", "FAIR") Ownable(msg.sender) {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }
    
    
    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For this token, we use 18 decimals, which is the standard for ERC20 tokens.
     */
    function decimals() public pure override returns (uint8) {
        return 18;
    }
    
    /**
     * @dev Mint new tokens to the specified address
     * @param to The address that will receive the minted tokens
     * @param amount The amount of tokens to mint
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }

    
    /**
     * @dev Burn tokens from the specified address
     * @param from The address that will have tokens burned
     * @param amount The amount of tokens to burn
     */
    function burn(address from, uint256 amount) public onlyOwner {
        _burn(from, amount);
    }

    /**
     * @dev Mint 50000 tokens to the specified address if their balance is less than 50000
     * @param user The address that will receive the minted tokens
     * @return bool Whether the minting was successful
     */
    function mint50000IfBalanceLow(address user) public  returns (bool) {
        uint256 threshold = 50000 * 10 ** decimals();
        if (balanceOf(user) < threshold) {
            _mint(user, threshold);
            return true;
        }
        return false;
    }

    /**
     * @dev Burn all tokens from the specified address
     * @param account The address whose tokens will be completely burned
     * @return uint256 The amount of tokens burned
     */
    function burnAll(address account) public onlyOwner returns (uint256) {
        uint256 balance = balanceOf(account);
        if (balance > 0) {
            _burn(account, balance);
        }
        return balance;
    }
}