pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC721/ERC721Mintable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Burnable.sol";
import "./ERC721FullCustom.sol";

contract MyERC721 is ERC721FullCustom, ERC721Mintable, ERC721Burnable {
    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI
    ) public ERC721FullCustom(name, symbol) {
        _setBaseURI(baseURI);
    }
}