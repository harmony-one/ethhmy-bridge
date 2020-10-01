pragma solidity 0.5.17;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract ERC20EthManager {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    mapping(bytes32 => bool) public usedEvents_;

    event Locked(
        address indexed token,
        address indexed sender,
        uint256 amount,
        address recipient
    );

    event Unlocked(
        address ethToken,
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
     * @param ethTokenAddr is the ethereum token contract address
     * @param amount amount of tokens to lock
     * @param recipient recipient address on the harmony chain
     */
    function lockToken(
        address ethTokenAddr,
        uint256 amount,
        address recipient
    ) public {
        require(
            recipient != address(0),
            "EthManager/recipient is a zero address"
        );
        require(amount > 0, "EthManager/zero token locked");
        IERC20 ethToken = IERC20(ethTokenAddr);
        uint256 _balanceBefore = ethToken.balanceOf(msg.sender);
        ethToken.safeTransferFrom(msg.sender, address(this), amount);
        uint256 _balanceAfter = ethToken.balanceOf(msg.sender);
        uint256 _actualAmount = _balanceBefore.sub(_balanceAfter);
        emit Locked(address(ethToken), msg.sender, _actualAmount, recipient);
    }

    /**
     * @dev lock tokens for a user address to be minted on harmony chain
     * @param ethTokenAddr is the ethereum token contract address
     * @param userAddr is token holder address
     * @param amount amount of tokens to lock
     * @param recipient recipient address on the harmony chain
     */
    function lockTokenFor(
        address ethTokenAddr,
        address userAddr,
        uint256 amount,
        address recipient
    ) public onlyWallet {
        require(
            recipient != address(0),
            "EthManager/recipient is a zero address"
        );
        require(amount > 0, "EthManager/zero token locked");
        IERC20 ethToken = IERC20(ethTokenAddr);
        uint256 _balanceBefore = ethToken.balanceOf(userAddr);
        ethToken.safeTransferFrom(userAddr, address(this), amount);
        uint256 _balanceAfter = ethToken.balanceOf(userAddr);
        uint256 _actualAmount = _balanceBefore.sub(_balanceAfter);
        emit Locked(address(ethToken), userAddr, _actualAmount, recipient);
    }

    /**
     * @dev unlock tokens after burning them on harmony chain
     * @param ethTokenAddr is the ethereum token contract address
     * @param amount amount of unlock tokens
     * @param recipient recipient of the unlock tokens
     * @param receiptId transaction hash of the burn event on harmony chain
     */
    function unlockToken(
        address ethTokenAddr,
        uint256 amount,
        address recipient,
        bytes32 receiptId
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "EthManager/The burn event cannot be reused"
        );
        IERC20 ethToken = IERC20(ethTokenAddr);
        usedEvents_[receiptId] = true;
        ethToken.safeTransfer(recipient, amount);
        emit Unlocked(ethTokenAddr, amount, recipient, receiptId);
    }
}
