pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC721/ERC721Mintable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";

contract MyERC721 is ERC721Full, ERC721Mintable, ERC721Burnable {
    constructor(
        string memory name,
        string memory symbol
    ) public ERC721Full(name, symbol) {}
}