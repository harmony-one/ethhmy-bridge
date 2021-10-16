pragma solidity 0.5.17;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721Holder.sol";
import "../erc1155/ERC1155Holder.sol";
import "../erc1155/IERC1155.sol";

contract NFTHmyManager is ERC721Holder, ERC1155Holder {
    using SafeMath for uint256;

    mapping(bytes32 => bool) public usedEvents_;

    event Locked(
        address indexed token,
        address indexed sender,
        uint256 tokenId,
        address recipient
    );

    event Unlocked(
        address ethToken,
        uint256 tokenId,
        address recipient,
        bytes32 receiptId
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
     */
    function lockNFT721Token(
        address ethTokenAddr,
        uint256 tokenId,
        address recipient
    ) public {
        require(
            recipient != address(0),
            "NFTHmyManager/recipient is a zero address"
        );
        IERC721 ethToken = IERC721(ethTokenAddr);
        ethToken.safeTransferFrom(msg.sender, address(this), tokenId);
        emit Locked(address(ethToken), msg.sender, tokenId, recipient);
    }

    /**
     * @dev lock tokens to be minted on harmony chain
     * @param ethTokenAddr is the ethereum token contract address
     * @param tokenId tokenId of the token to lock
     * @param recipient recipient address on the harmony chain
     */
    function lockNFT1155Token(
        address ethTokenAddr,
        uint256 tokenId,
        address recipient,
        uint256 amount,
        bytes memory data
    ) public {
        
    }

    /**
     * @dev lock tokens to be minted on harmony chain
     * @param ethTokenAddr is the ethereum token contract address
     * @param tokenIds tokenIds of the token to lock
     * @param recipient recipient address on the harmony chain
     */
    function lockTokens(
        address ethTokenAddr,
        uint256[] memory tokenIds,
        address recipient
    ) public {
        require(
            recipient != address(0),
            "NFTHmyManager/recipient is a zero address"
        );
        IERC721 ethToken = IERC721(ethTokenAddr);
        for (uint256 index = 0; index < tokenIds.length; index++) {
            ethToken.safeTransferFrom(
                msg.sender,
                address(this),
                tokenIds[index]
            );
            emit Locked(
                address(ethToken),
                msg.sender,
                tokenIds[index],
                recipient
            );
        }
    }

    /**
     * @dev lock tokens to be minted on harmony chain
     * @param ethTokenAddr is the ethereum token contract address
     * @param tokenIds tokenIds of the token to lock
     * @param recipient recipient address on the harmony chain
     */
    function lockNFT1155Tokens(
        address ethTokenAddr,
        uint256[] memory tokenIds,
        address recipient
    ) public {

    }

    /**
     * @dev unlock tokens after burning them on harmony chain
     * @param ethTokenAddr is the ethereum token contract address
     * @param tokenId tokenId of the token to unlock
     * @param recipient recipient of the unlock tokens
     * @param receiptId transaction hash of the burn event on harmony chain
     */
    function unlockToken(
        address ethTokenAddr,
        uint256 tokenId,
        address recipient,
        bytes32 receiptId
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "NFTHmyManager/The burn event cannot be reused"
        );
        IERC721 ethToken = IERC721(ethTokenAddr);
        ethToken.safeTransferFrom(address(this), recipient, tokenId);
        usedEvents_[receiptId] = true;
        emit Unlocked(ethTokenAddr, tokenId, recipient, receiptId);
    }

    function unlockNFT1155Token(
        address ethTokenAddr,
        uint256 tokenId,
        address recipient,
        bytes32 receiptId
    ) public onlyWallet {

    }

    /**
     * @dev unlock tokens after burning them on harmony chain
     * @param ethTokenAddr is the ethereum token contract address
     * @param tokenIds tokenIds of the token to unlock
     * @param recipient recipient of the unlock tokens
     * @param receiptId transaction hash of the burn event on harmony chain
     */
    function unlockTokens(
        address ethTokenAddr,
        uint256[] memory tokenIds,
        address recipient,
        bytes32 receiptId
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "NFTHmyManager/The burn event cannot be reused"
        );
        IERC721 ethToken = IERC721(ethTokenAddr);
        for (uint256 index = 0; index < tokenIds.length; index++) {
            ethToken.safeTransferFrom(address(this), recipient, tokenIds[index]);
            emit Unlocked(ethTokenAddr, tokenIds[index], recipient, receiptId);
        }
        usedEvents_[receiptId] = true;
    }

    function unlockNFT1155Tokens(
        address ethTokenAddr,
        uint256[] memory tokenIds,
        address recipient,
        bytes32 receiptId
    ) public onlyWallet {

    }
}
