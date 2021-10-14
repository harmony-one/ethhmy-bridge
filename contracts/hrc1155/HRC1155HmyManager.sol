pragma solidity 0.5.17;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../erc1155/ERC1155Holder.sol";
import "../erc1155/IERC1155.sol";

contract HRC1155HmyManager is ERC1155Holder {
    using SafeMath for uint256;

    mapping(bytes32 => bool) public usedEvents_;

    event Locked(
        address indexed token,
        address indexed sender,
        uint256 tokenId,
        address recipient,
        uint256 amount
    );

    event Unlocked(
        address ethToken,
        uint256 tokenId,
        address recipient,
        bytes32 receiptId,
        uint256 amount
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
     * @param amount amount of the token
     * @param data additional data with no specified format, sent in call to `_to`
     */
    function lockHRC1155Tokens(
        address ethTokenAddr,
        uint256[] memory tokenIds,
        address recipient,
        uint256 amount,
        bytes memory data
    ) public {
        require(
            recipient != address(0),
            "NFTHmyManager/recipient is a zero address"
        );
        IERC1155 ethToken = IERC1155(ethTokenAddr);
        for (uint256 index = 0; index < tokenIds.length; index++) {
            ethToken.safeTransferFrom(
                msg.sender, address(this), tokenIds[index], amount, data
            );
            emit Locked(
                address(ethToken),
                msg.sender,
                tokenIds[index],
                recipient,
                amount
            );
        }
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
     * @param amount amount of the token
     * @param data additional data with no specified format, sent in call to `_to`
     */
    function unlockHRC1155Tokens(
        address ethTokenAddr,
        uint256[] memory tokenIds,
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
        for (uint256 index = 0; index < tokenIds.length; index++) {
            ethToken.safeTransferFrom(address(this), recipient, tokenIds[index], amount, data);
            emit Unlocked(ethTokenAddr, tokenIds[index], recipient, receiptId, amount);
        }
        usedEvents_[receiptId] = true;
    }
}
