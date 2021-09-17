pragma solidity 0.5.17;

import "@openzeppelin/contracts/ownership/Ownable.sol";
import "@openzeppelin/contracts/access/roles/MinterRole.sol";
import "../erc1155/ERC1155.sol";
import "../erc1155/ERC1155Metadata.sol";
import "../erc1155/ERC1155MintBurn.sol";
import "./StringsV2.sol";

contract BridgedNFT1155 is
    ERC1155,
    ERC1155MintBurn,
    ERC1155Metadata,
    Ownable,
    MinterRole
{
    using StringsV2 for string;

    address public srcTokenAddr;
    uint256 public counter;
    // Contract name
    string public name;
    // Contract symbol
    string public symbol;

    mapping(uint256 => uint256) public tokenSupply;

    constructor(
        address _srcTokenAddr,
        string memory _name,
        string memory _symbol,
        string memory _baseMetadataURI
    ) public {
        srcTokenAddr = _srcTokenAddr;
        name = _name;
        symbol = _symbol;
        _setBaseMetadataURI(_baseMetadataURI);
    }

    function uri(uint256 _id) public view returns (string memory) {
        return StringsV2.strConcat(baseMetadataURI, StringsV2.uint2str(_id));
    }

    /**
     * @dev Returns the total quantity for a token ID
     * @param _id uint256 ID of the token to query
     * @return amount of token in existence
     */
    function totalSupply(uint256 _id) public view returns (uint256) {
        return tokenSupply[_id];
    }

    /**
     * @dev Will update the base URL of token's URI
     * @param _newBaseMetadataURI New base URL of token's URI
     */
    function setBaseMetadataURI(string memory _newBaseMetadataURI)
        public
        onlyOwner
    {
        _setBaseMetadataURI(_newBaseMetadataURI);
    }

    /**
     * @dev Mints some amount of tokens to an address
     * @param _to          Address of the future owner of the token
     * @param _id          Token ID to mint
     * @param _quantity    Amount of tokens to mint
     * @param _data        Data to pass if receiver is contract
     */
    function mint(
        address _to,
        uint256 _id,
        uint256 _quantity,
        bytes memory _data
    ) public onlyMinter {
        _mint(_to, _id, _quantity, _data);
        tokenSupply[_id] = tokenSupply[_id].add(_quantity);
    }

    /**
     * @dev Mint tokens for each id in _ids
     * @param _to          The address to mint tokens to
     * @param _ids         Array of ids to mint
     * @param _quantities  Array of amounts of tokens to mint per id
     * @param _data        Data to pass if receiver is contract
     */
    function batchMint(
        address _to,
        uint256[] memory _ids,
        uint256[] memory _quantities,
        bytes memory _data
    ) public onlyMinter {
        for (uint256 i = 0; i < _ids.length; i++) {
            uint256 _id = _ids[i];
            uint256 quantity = _quantities[i];
            tokenSupply[_id] = tokenSupply[_id].add(quantity);
        }
        _batchMint(_to, _ids, _quantities, _data);
    }

    function isOwnerOrApproved(address operator) internal view returns (bool) {
        return (isOwner() || isApprovedForAll(owner(), operator));
    }

    /**
     * @notice Burn _amount of tokens of a given token id
     * @param _from    The address to burn tokens from
     * @param _id      Token id to burn
     * @param _amount  The amount to be burned
     */
    function burn(
        address _from,
        uint256 _id,
        uint256 _amount
    ) public {
        require(
            isOwnerOrApproved(_msgSender()),
            "BridgedNFT1155: caller is not owner nor approved"
        );
        //Substract _amount
        balances[_from][_id] = balances[_from][_id].sub(_amount);

        // Emit event
        emit TransferSingle(msg.sender, _from, address(0x0), _id, _amount);
    }

    /**
     * @notice Burn tokens of given token id for each (_ids[i], _amounts[i]) pair
     * @param _from     The address to burn tokens from
     * @param _ids      Array of token ids to burn
     * @param _amounts  Array of the amount to be burned
     */
    function batchBurn(
        address _from,
        uint256[] memory _ids,
        uint256[] memory _amounts
    ) public {
        require(
            _ids.length == _amounts.length,
            "BridgedNFT1155#batchBurn: INVALID_ARRAYS_LENGTH"
        );
        require(
            isOwnerOrApproved(_msgSender()),
            "BridgedNFT1155: caller is not owner nor approved"
        );

        // Number of mints to execute
        uint256 nBurn = _ids.length;

        // Executing all minting
        for (uint256 i = 0; i < nBurn; i++) {
            // Update storage balance
            balances[_from][_ids[i]] = balances[_from][_ids[i]].sub(
                _amounts[i]
            );
        }

        // Emit batch mint event
        emit TransferBatch(msg.sender, _from, address(0x0), _ids, _amounts);
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
