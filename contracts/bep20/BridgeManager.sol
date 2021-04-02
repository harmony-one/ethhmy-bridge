pragma solidity 0.5.17;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "../lib/TokenManager.sol";

interface MintableToken {
    function mint(address beneficiary, uint256 amount) external returns (bool);
}

interface BurnableToken {
    function burnFrom(address account, uint256 amount) external;
}

contract BridgeManager {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public constant ZERO_ADDRESS = IERC20(0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee);

    mapping(bytes32 => bool) public usedEvents_;
    mapping(address => address) public mappings;
    
    event Locked(
        address indexed tokenAddr,
        address indexed sender,
        uint256 amount,
        address recipient
    );

    event Unlocked(
        address tokenAddr,
        uint256 amount,
        address recipient,
        bytes32 receiptId
    );

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
        require(msg.sender == wallet, "BridgeManager/not-authorized");
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
     * @dev map an source token to destination
     * @param tokenManager address to token manager
     * @param tokenAddr ethereum token address to map
     * @param name of the ethereum token
     * @param symbol of the ethereum token
     * @param decimals of the ethereum token
     */
    function addToken(
        address tokenManager,
        address tokenAddr,
        string memory name,
        string memory symbol,
        uint8 decimals
    ) public {
        address oneTokenAddr = TokenManager(tokenManager).addToken(
            tokenAddr,
            name,
            symbol,
            decimals
        );
        mappings[tokenAddr] = oneTokenAddr;
    }

    /**
     * @dev deregister token mapping in the token manager
     * @param tokenManager address to token manager
     * @param tokenAddr address to remove token
     */
    function removeToken(address tokenManager, address tokenAddr) public {
        TokenManager(tokenManager).removeToken(tokenAddr, 0);
    }

    /**
     * @dev lock tokens to be minted on other chain
     * @param tokenAddr is the ethereum token contract address
     * @param amount amount of tokens to lock
     * @param recipient recipient address on the other chain
     */
    function lockToken(
        address tokenAddr,
        uint256 amount,
        address recipient
    ) public {
        require(
            recipient != address(0),
            "BridgeManager/recipient is a zero address"
        );
        require(amount > 0, "BridgeManager/zero token locked");
        IERC20 ethToken = IERC20(tokenAddr);
        uint256 _balanceBefore = ethToken.balanceOf(address(this));
        ethToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 _balanceAfter = ethToken.balanceOf(address(this));
        uint256 _actualAmount = _balanceAfter.sub(_balanceBefore);
        emit Locked(address(ethToken), msg.sender, _actualAmount, recipient);
    }

    /**
     * @dev unlock tokens after burning them on other chain
     * @param tokenAddr is the ethereum token contract address
     * @param amount amount of unlock tokens
     * @param recipient recipient of the unlock tokens
     * @param receiptId transaction hash of the burn event on other chain
     */
    function unlockToken(
        address tokenAddr,
        uint256 amount,
        address recipient,
        bytes32 receiptId
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "EthManager/The burn event cannot be reused"
        );
        IERC20 ethToken = IERC20(tokenAddr);
        usedEvents_[receiptId] = true;
        ethToken.safeTransfer(recipient, amount);
        emit Unlocked(tokenAddr, amount, recipient, receiptId);
    }

    /**
     * @dev burns tokens on harmony to be unlocked on ethereum
     * @param tokenAddr harmony token address
     * @param amount amount of tokens to burn
     * @param recipient recipient of the unlock tokens on ethereum
     */
    function burnToken(
        address tokenAddr,
        uint256 amount,
        address recipient
    ) public {
        BurnableToken(tokenAddr).burnFrom(msg.sender, amount);
        emit Burned(tokenAddr, msg.sender, amount, recipient);
    }

    /**
     * @dev mints tokens corresponding to the tokens locked in the ethereum chain
     * @param tokenAddr is the token address for minting
     * @param amount amount of tokens for minting
     * @param recipient recipient of the minted tokens (harmony address)
     * @param receiptId transaction hash of the lock event on ethereum chain
     */
    function mintToken(
        address tokenAddr,
        uint256 amount,
        address recipient,
        bytes32 receiptId
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "HmyManager/The lock event cannot be reused"
        );
        usedEvents_[receiptId] = true;
        MintableToken(tokenAddr).mint(recipient, amount);
        emit Minted(tokenAddr, amount, recipient, receiptId);
    }

    /**
     * @dev lock native tokens to be minted on other chain
     * @param amount amount of tokens to lock
     * @param recipient recipient address on the other chain
     */
    function lockNative(
        uint256 amount,
        address recipient
    ) public payable {
        require(
            recipient != address(0),
            "BridgeManager/recipient is a zero address"
        );
        require(msg.value == amount, "BridgeManager/zero token locked");
        emit Locked(address(ZERO_ADDRESS), msg.sender, amount, recipient);
    }

    /**
     * @dev unlock native tokens after burning them on other chain
     * @param amount amount of unlock tokens
     * @param recipient recipient of the unlock tokens
     * @param receiptId transaction hash of the burn event on other chain
     */
    function unlockNative(
        uint256 amount,
        address payable recipient,
        bytes32 receiptId
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "BridgeManager/The burn event cannot be reused"
        );
        usedEvents_[receiptId] = true;
        recipient.transfer(amount);
        emit Unlocked(address(ZERO_ADDRESS), amount, recipient, receiptId);
    }
}
