pragma solidity 0.5.17;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "../lib/NFTTokenManager.sol";
import "../lib/BridgedNFTToken.sol";

interface MintableToken {
    function mint(address beneficiary, uint256 tokenId) external returns (bool);
}

interface BurnableToken {
    function burnFrom(address account, uint256 tokenId) external;
}

contract ERC721HmyManager {
    mapping(bytes32 => bool) public usedEvents_;
    mapping(address => address) public mappings;

    event Burned(
        address indexed token,
        address indexed sender,
        uint256 tokenId,
        address recipient
    );

    event Minted(
        address oneToken,
        uint256 tokenId,
        address recipient,
        bytes32 receiptId
    );

    address public wallet;
    modifier onlyWallet {
        require(msg.sender == wallet, "HmyManager/not-authorized");
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
     * @dev map an ethereum token to harmony
     * @param tokenManager address to token manager
     * @param ethTokenAddr ethereum token address to map
     * @param name of the ethereum token
     * @param symbol of the ethereum token
     * @param baseURI base URI of the token
     */
    function addToken(
        address tokenManager,
        address ethTokenAddr,
        string memory name,
        string memory symbol,
        string memory baseURI
    ) public {
        address oneTokenAddr = NFTTokenManager(tokenManager).addToken(
            ethTokenAddr,
            name,
            symbol,
            baseURI
        );
        mappings[ethTokenAddr] = oneTokenAddr;
    }

    /**
     * @dev deregister token mapping in the token manager
     * @param tokenManager address to token manager
     * @param ethTokenAddr address to remove token
     */
    function removeToken(address tokenManager, address ethTokenAddr) public {
        NFTTokenManager(tokenManager).removeToken(ethTokenAddr, 0);
    }

    /**
     * @dev burns tokens on harmony to be unlocked on ethereum
     * @param oneToken harmony token address
     * @param tokenId tokenId to burn
     * @param recipient recipient of the unlock tokens on ethereum
     */
    function burnToken(
        address oneToken,
        uint256 tokenId,
        address recipient
    ) public {
        BurnableToken(oneToken).burnFrom(msg.sender, tokenId);
        BridgedNFTToken(oneToken).decrement();
        emit Burned(oneToken, msg.sender, tokenId, recipient);
    }

    /**
     * @dev burns tokens on harmony to be unlocked on ethereum
     * @param oneToken harmony token address
     * @param tokenIds tokenIds to burn
     * @param recipient recipient of the unlock tokens on ethereum
     */
    function burnTokens(
        address oneToken,
        uint256[] memory tokenIds,
        address recipient
    ) public {
        for (uint256 index = 0; index < tokenIds.length; index++) {
            BurnableToken(oneToken).burnFrom(msg.sender, tokenIds[index]);
            BridgedNFTToken(oneToken).decrement();
            emit Burned(oneToken, msg.sender, tokenIds[index], recipient);
        }
    }

    /**
     * @dev mints tokens corresponding to the tokens locked in the ethereum chain
     * @param oneToken is the token address for minting
     * @param tokenId tokenId for minting
     * @param recipient recipient of the minted tokens (harmony address)
     * @param receiptId transaction hash of the lock event on ethereum chain
     */
    function mintToken(
        address oneToken,
        uint256 tokenId,
        address recipient,
        bytes32 receiptId
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "HmyManager/The lock event cannot be reused"
        );
        MintableToken(oneToken).mint(recipient, tokenId);
        usedEvents_[receiptId] = true;
        BridgedNFTToken(oneToken).increment();
        emit Minted(oneToken, tokenId, recipient, receiptId);
    }

    /**
     * @dev mints tokens corresponding to the tokens locked in the ethereum chain
     * @param oneToken is the token address for minting
     * @param tokenIds tokenIds for minting
     * @param recipient recipient of the minted tokens (harmony address)
     * @param receiptId transaction hash of the lock event on ethereum chain
     */
    function mintTokens(
        address oneToken,
        uint256[] memory tokenIds,
        address recipient,
        bytes32 receiptId
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "HmyManager/The lock event cannot be reused"
        );
        for (uint256 index = 0; index < tokenIds.length; index++) {
            MintableToken(oneToken).mint(recipient, tokenIds[index]);
            BridgedNFTToken(oneToken).increment();
            emit Minted(oneToken, tokenIds[index], recipient, receiptId);
        }
        usedEvents_[receiptId] = true;
    }
}
