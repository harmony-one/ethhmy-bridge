pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Enumerable.sol";
import "./ERC721MetadataCustom.sol";

/**
 * @title Full ERC721 Token
 * @dev This implementation includes all the required and some optional functionality of the ERC721 standard
 * Moreover, it includes approve all functionality using operator terminology.
 *
 * See https://eips.ethereum.org/EIPS/eip-721
 */
contract ERC721FullCustom is ERC721, ERC721Enumerable, ERC721MetadataCustom {
    constructor (string memory name, string memory symbol) public ERC721MetadataCustom(name, symbol) {
        // solhint-disable-previous-line no-empty-blocks
    }
}
