pragma solidity 0.5.17;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../lib/TokenManager.sol";

interface MintableToken {
    function mint(address beneficiary, uint256 amount) external returns (bool);
}

interface BurnableToken {
    function burnFrom(address account, uint256 amount) external;
}

contract ERC20HmyManager {
    mapping(bytes32 => bool) public usedEvents_;
    mapping(address => address) public mappings;

    event Burned(
        address indexed token,
        address indexed sender,
        uint256 amount,
        address recipient
    );

    event Minted(
        address oneToken,
        uint256 amount,
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
     * @param decimals of the ethereum token
     */
    function addToken(
        address tokenManager,
        address ethTokenAddr,
        string memory name,
        string memory symbol,
        uint8 decimals
    ) public {
        address oneTokenAddr = TokenManager(tokenManager).addToken(
            ethTokenAddr,
            name,
            symbol,
            decimals
        );
        mappings[ethTokenAddr] = oneTokenAddr;
    }

    /**
     * @dev deregister token mapping in the token manager
     * @param tokenManager address to token manager
     * @param ethTokenAddr address to remove token
     */
    function removeToken(address tokenManager, address ethTokenAddr) public {
        TokenManager(tokenManager).removeToken(ethTokenAddr, 0);
    }

    /**
     * @dev burns tokens on harmony to be unlocked on ethereum
     * @param oneToken harmony token address
     * @param amount amount of tokens to burn
     * @param recipient recipient of the unlock tokens on ethereum
     */
    function burnToken(
        address oneToken,
        uint256 amount,
        address recipient
    ) public {
        BurnableToken(oneToken).burnFrom(msg.sender, amount);
        emit Burned(oneToken, msg.sender, amount, recipient);
    }

    /**
     * @dev mints tokens corresponding to the tokens locked in the ethereum chain
     * @param oneToken is the token address for minting
     * @param amount amount of tokens for minting
     * @param recipient recipient of the minted tokens (harmony address)
     * @param receiptId transaction hash of the lock event on ethereum chain
     */
    function mintToken(
        address oneToken,
        uint256 amount,
        address recipient,
        bytes32 receiptId
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "HmyManager/The lock event cannot be reused"
        );
        usedEvents_[receiptId] = true;
        MintableToken(oneToken).mint(recipient, amount);
        emit Minted(oneToken, amount, recipient, receiptId);
    }
}
