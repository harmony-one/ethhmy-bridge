pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Mintable.sol";

contract BridgedToken is ERC20Burnable, ERC20Detailed, ERC20Mintable {
    address public ethTokenAddr;
    constructor(
        address _ethTokenAddr,
        string memory name,
        string memory symbol,
        uint8 decimals
    ) public ERC20Detailed(name, symbol, decimals) {
        ethTokenAddr = _ethTokenAddr;
    }
}