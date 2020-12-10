pragma solidity 0.5.17;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract HRC20HmyManager {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public constant HMY_ADDRESS = IERC20(0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee);

    mapping(bytes32 => bool) public usedEvents_;

    event Locked(
        address indexed token,
        address indexed sender,
        uint256 amount,
        address recipient
    );

    event Unlocked(
        address hmyToken,
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
     * @dev lock tokens to be minted on harmony chain
     * @param hmyTokenAddr is the ethereum token contract address
     * @param amount amount of tokens to lock
     * @param recipient recipient address on the harmony chain
     */
    function lockToken(
        address hmyTokenAddr,
        uint256 amount,
        address recipient
    ) public {
        require(
            recipient != address(0),
            "HmyManager/recipient is a zero address"
        );
        require(amount > 0, "HmyManager/zero token locked");
        IERC20 hmyToken = IERC20(hmyTokenAddr);
        uint256 _balanceBefore = hmyToken.balanceOf(msg.sender);
        hmyToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 _balanceAfter = hmyToken.balanceOf(msg.sender);
        uint256 _actualAmount = _balanceBefore.sub(_balanceAfter);
        emit Locked(address(hmyToken), msg.sender, _actualAmount, recipient);
    }

    /**
     * @dev lock tokens for a user address to be minted on harmony chain
     * @param hmyTokenAddr is the ethereum token contract address
     * @param userAddr is token holder address
     * @param amount amount of tokens to lock
     * @param recipient recipient address on the harmony chain
     */
    function lockTokenFor(
        address hmyTokenAddr,
        address userAddr,
        uint256 amount,
        address recipient
    ) public onlyWallet {
        require(
            recipient != address(0),
            "HmyManager/recipient is a zero address"
        );
        require(amount > 0, "HmyManager/zero token locked");
        IERC20 hmyToken = IERC20(hmyTokenAddr);
        uint256 _balanceBefore = hmyToken.balanceOf(userAddr);
        hmyToken.safeTransferFrom(userAddr, address(this), amount);
        uint256 _balanceAfter = hmyToken.balanceOf(userAddr);
        uint256 _actualAmount = _balanceBefore.sub(_balanceAfter);
        emit Locked(address(hmyToken), userAddr, _actualAmount, recipient);
    }

    /**
     * @dev unlock tokens after burning them on harmony chain
     * @param hmyTokenAddr is the ethereum token contract address
     * @param amount amount of unlock tokens
     * @param recipient recipient of the unlock tokens
     * @param receiptId transaction hash of the burn event on harmony chain
     */
    function unlockToken(
        address hmyTokenAddr,
        uint256 amount,
        address recipient,
        bytes32 receiptId
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "HmyManager/The burn event cannot be reused"
        );
        IERC20 hmyToken = IERC20(hmyTokenAddr);
        usedEvents_[receiptId] = true;
        hmyToken.safeTransfer(recipient, amount);
        emit Unlocked(hmyTokenAddr, amount, recipient, receiptId);
    }

    /**
     * @dev lock ONE to be minted on ethereum chain
     * @param amount amount of tokens to lock
     * @param recipient recipient address on the harmony chain
     */
    function lockOne(
        uint256 amount,
        address recipient
    ) public payable {
        require(
            recipient != address(0),
            "HmyManager/recipient is a zero address"
        );
        require(msg.value == amount, "HmyManager/zero token locked");
        emit Locked(address(HMY_ADDRESS), msg.sender, amount, recipient);
    }

    /**
     * @dev unlock ETHs after burning them on harmony chain
     * @param amount amount of unlock tokens
     * @param recipient recipient of the unlock tokens
     * @param receiptId transaction hash of the burn event on harmony chain
     */
    function unlockOne(
        uint256 amount,
        address payable recipient,
        bytes32 receiptId
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "HmyManager/The burn event cannot be reused"
        );
        usedEvents_[receiptId] = true;
        recipient.transfer(amount);
        emit Unlocked(address(HMY_ADDRESS), amount, recipient, receiptId);
    }
}
