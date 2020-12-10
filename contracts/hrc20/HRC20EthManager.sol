pragma solidity 0.5.17;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../lib/TokenManager.sol";

interface MintableToken {
    function mint(address beneficiary, uint256 amount) external returns (bool);
}

interface BurnableToken {
    function burnFrom(address account, uint256 amount) external;
}

contract HRC20EthManager {
    mapping(bytes32 => bool) public usedEvents_;
    mapping(address => address) public mappings;

    event Burned(
        address indexed token,
        address indexed sender,
        uint256 amount,
        address recipient
    );

    event Minted(
        address ethToken,
        uint256 amount,
        address recipient,
        bytes32 receiptId
    );

    address public wallet;
    modifier onlyWallet {
        require(msg.sender == wallet, "EthManager/not-authorized");
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
     * @dev map an harmony token to ethereum
     * @param tokenManager address to token manager
     * @param hmyTokenAddr harmony token address to map
     * @param name of the harmony token
     * @param symbol of the harmony token
     * @param decimals of the harmony token
     */
    function addToken(
        address tokenManager,
        address hmyTokenAddr,
        string memory name,
        string memory symbol,
        uint8 decimals
    ) public {
        address ethTokenAddr = TokenManager(tokenManager).addToken(
            hmyTokenAddr,
            name,
            symbol,
            decimals
        );
        mappings[hmyTokenAddr] = ethTokenAddr;
    }

    /**
     * @dev deregister token mapping in the token manager
     * @param tokenManager address to token manager
     * @param hmyTokenAddr address to remove token
     */
    function removeToken(address tokenManager, address hmyTokenAddr) public {
        TokenManager(tokenManager).removeToken(hmyTokenAddr, 0);
    }

    /**
     * @dev burns tokens on ethereum to be unlocked on harmony
     * @param ethToken ethereum token address
     * @param amount amount of tokens to burn
     * @param recipient recipient of the unlock tokens on ethereum
     */
    function burnToken(
        address ethToken,
        uint256 amount,
        address recipient
    ) public {
        BurnableToken(ethToken).burnFrom(msg.sender, amount);
        emit Burned(ethToken, msg.sender, amount, recipient);
    }

    /**
     * @dev mints tokens corresponding to the tokens locked in the harmony chain
     * @param ethToken is the token address for minting
     * @param amount amount of tokens for minting
     * @param recipient recipient of the minted tokens (ethereum address)
     * @param receiptId transaction hash of the lock event on harmony chain
     */
    function mintToken(
        address ethToken,
        uint256 amount,
        address recipient,
        bytes32 receiptId
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "EthManager/The lock event cannot be reused"
        );
        usedEvents_[receiptId] = true;
        MintableToken(ethToken).mint(recipient, amount);
        emit Minted(ethToken, amount, recipient, receiptId);
    }
}
