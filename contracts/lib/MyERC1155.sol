pragma solidity 0.5.17;

import "../erc1155/ERC1155.sol";
import "../erc1155/ERC1155Metadata.sol";
import "../erc1155/ERC1155MintBurn.sol";

contract MyERC1155 is ERC1155, ERC1155MintBurn, ERC1155Metadata {
    string private _name;
    string private _symbol;

    constructor(
        string memory name,
        string memory symbol,
        string memory uri
    ) public ERC1155() {
        _name = name;
        _symbol = symbol;
        _setBaseMetadataURI(uri);
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view returns (string memory) {
        return _name;
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view returns (string memory) {
        return _symbol;
    }
}
