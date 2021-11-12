pragma solidity 0.5.17;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../erc1155/ERC1155Holder.sol";
import "../erc1155/IERC1155.sol";

contract ERC1155EthManager is ERC1155Holder {
    using SafeMath for uint256;

    mapping(bytes32 => bool) public usedEvents_;

    event Locked(
        address indexed token,
        address indexed sender,
        uint256 tokenId,
        address recipient,
        uint256 amount
    );

    event BatchLocked(
        address indexed token,
        address indexed sender,
        uint256[] tokenIds,
        address recipient,
        uint256[] amounts
    );

    event Unlocked(
        address ethToken,
        uint256 tokenId,
        address recipient,
        bytes32 receiptId,
        uint256 amount
    );

    event BatchUnlocked(
        address ethToken,
        uint256[] tokenIds,
        address recipient,
        bytes32 receiptId,
        uint256[] amounts
    );

    address public wallet;
    modifier onlyWallet {
        require(msg.sender == wallet, "NFTHmyManager/not-authorized");
        _;
    }

    /**
     * @dev constructor
     * @param _wallet is the multisig wallet
     */
    constructor(address _wallet) public {
        wallet = _wallet;
    }

    /**
     * @dev lock tokens to be minted on harmony chain
     * @param ethTokenAddr is the ethereum token contract address
     * @param tokenId tokenId of the token to lock
     * @param recipient recipient address on the harmony chain
     * @param amount amount of the token
     * @param data additional data with no specified format, sent in call to `_to`
     */
    function lockHRC1155Token(
        address ethTokenAddr,
        uint256 tokenId,
        address recipient,
        uint256 amount,
        bytes memory data
    ) public {
        IERC1155 ethToken = IERC1155(ethTokenAddr);
        ethToken.safeTransferFrom(msg.sender, address(this), tokenId, amount, data);
        emit Locked(address(ethToken), msg.sender, tokenId, recipient, amount);
    }

    /**
     * @dev lock tokens to be minted on harmony chain
     * @param ethTokenAddr is the ethereum token contract address
     * @param tokenIds tokenIds of the token to lock
     * @param recipient recipient address on the harmony chain
     * @param amounts amounts of the token
     * @param data additional data with no specified format, sent in call to `_to`
     */
    function lockHRC1155Tokens(
        address ethTokenAddr,
        uint256[] memory tokenIds,
        address recipient,
        uint256[] memory amounts,
        bytes memory data
    ) public {
        require(
            recipient != address(0),
            "NFTHmyManager/recipient is a zero address"
        );
        IERC1155 ethToken = IERC1155(ethTokenAddr);

        ethToken.safeBatchTransferFrom(msg.sender, address(this), tokenIds, amounts, data);
        emit BatchLocked(ethTokenAddr, msg.sender, tokenIds, recipient, amounts);
    }

    /**
     * @dev unlock tokens after burning them on harmony chain
     * @param ethTokenAddr is the ethereum token contract address
     * @param tokenId tokenId of the token to lock
     * @param recipient recipient address on the harmony chain
     * @param amount amount of the token
     * @param data additional data with no specified format, sent in call to `_to`
     */
    function unlockHRC1155Token(
        address ethTokenAddr,
        uint256 tokenId,
        address recipient,
        bytes32 receiptId,
        uint256 amount,
        bytes memory data
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "NFTHmyManager/The burn event cannot be reused"
        );
        IERC1155 ethToken = IERC1155(ethTokenAddr);
        ethToken.safeTransferFrom(address(this), recipient, tokenId, amount, data);
        usedEvents_[receiptId] = true;
        emit Unlocked(ethTokenAddr, tokenId, recipient, receiptId, amount);
    }

    /**
     * @dev unlock tokens after burning them on harmony chain
     * @param ethTokenAddr is the ethereum token contract address
     * @param tokenIds tokenIds of the token to unlock
     * @param recipient recipient of the unlock tokens
     * @param receiptId transaction hash of the burn event on harmony chain
     * @param amounts amount of the token
     * @param data additional data with no specified format, sent in call to `_to`
     */
    function unlockHRC1155Tokens(
        address ethTokenAddr,
        uint256[] memory tokenIds,
        address recipient,
        bytes32 receiptId,
        uint256[] memory amounts,
        bytes memory data
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "NFTHmyManager/The burn event cannot be reused"
        );
        IERC1155 ethToken = IERC1155(ethTokenAddr);
        ethToken.safeBatchTransferFrom(address(this), recipient, tokenIds, amounts, data);
        emit BatchUnlocked(ethTokenAddr, tokenIds, recipient, receiptId, amounts);
        usedEvents_[receiptId] = true;
    }
}
