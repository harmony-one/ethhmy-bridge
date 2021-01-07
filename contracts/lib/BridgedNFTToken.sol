pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC721/ERC721Full.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Mintable.sol";

contract BridgedNFTToken is ERC721Mintable, ERC721Burnable, ERC721Full {
    address public ethTokenAddr;
    uint256 public counter;
    constructor(
        address _ethTokenAddr,
        string memory name,
        string memory symbol,
        string memory baseURI
    ) public ERC721Full(name, symbol) {
        ethTokenAddr = _ethTokenAddr;
        _setBaseURI(baseURI);
    }

    function burnFrom(address owner, uint256 tokenId) public {
        //solhint-disable-next-line max-line-length
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721Burnable: caller is not owner nor approved");
        _burn(owner, tokenId);
    }

    function setTokenURI(uint256 tokenId, string memory tokenURI) public {
        require(_msgSender() == ownerOf(tokenId), "only owner can set tokenURI");
        _setTokenURI(tokenId, tokenURI);
    }

    function increment() public onlyMinter {
        counter += 1;
    }

    function decrement() public onlyMinter {
        counter -= 1;
    }

    function checkSupply(uint256 value) public view returns (bool) {
        return counter == value;
    }
}