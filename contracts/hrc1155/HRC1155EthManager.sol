pragma solidity 0.5.17;

import "../erc1155/IERC1155.sol";
import "../lib/HRC1155TokenManager.sol";
import "../lib/Bridged1155Token.sol";

interface MintableToken {
    function mint(address _to, uint256 _id, uint256 _quantity, bytes calldata _data) external;
}

interface BurnableToken {
    function burn(address _from, uint256 _id, uint256 _amount) external;
}

contract HRC1155EthManager {
    mapping(bytes32 => bool) public usedEvents_;
    mapping(address => address) public mappings;

    event Burned(
        address indexed token,
        address indexed sender,
        uint256 tokenId,
        address recipient,
        uint256 amount
    );

    event Minted(
        address oneToken,
        uint256 tokenId,
        address recipient,
        bytes32 receiptId,
        uint256 amount
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
        address oneTokenAddr = HRC1155TokenManager(tokenManager).addHRC1155Token(
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
        HRC1155TokenManager(tokenManager).removeHRC1155Token(ethTokenAddr, 0);
        delete mappings[ethTokenAddr];
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
        address recipient,
        uint256 amount
    ) public {
        BurnableToken(oneToken).burn(msg.sender, tokenId, amount);
        Bridged1155Token(oneToken).decrement(amount);
        emit Burned(oneToken, msg.sender, tokenId, recipient, amount);
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
        address recipient,
        uint256 amount
    ) public {
        for (uint256 index = 0; index < tokenIds.length; index++) {
            BurnableToken(oneToken).burn(msg.sender, tokenIds[index], amount);
            Bridged1155Token(oneToken).decrement(amount);
            emit Burned(oneToken, msg.sender, tokenIds[index], recipient, amount);
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
        bytes32 receiptId,
        uint256 amount,
        bytes memory data
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "HmyManager/The lock event cannot be reused"
        );
        MintableToken(oneToken).mint(recipient, tokenId, amount, data);
        Bridged1155Token(oneToken).increment(amount);
        emit Minted(oneToken, tokenId, recipient, receiptId, amount);

        usedEvents_[receiptId] = true;
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
        bytes32 receiptId,
        uint256 amount,
        bytes memory data
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "HmyManager/The lock event cannot be reused"
        );
        for (uint256 index = 0; index < tokenIds.length; index++) {
            MintableToken(oneToken).mint(recipient, tokenIds[index], amount, data);
            Bridged1155Token(oneToken).increment(amount);
            emit Minted(oneToken, tokenIds[index], recipient, receiptId, amount);
        }

        usedEvents_[receiptId] = true;
    }
}
