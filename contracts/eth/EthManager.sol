pragma solidity 0.5.17;
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract EthManager {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public constant ETH_ADDRESS = IERC20(0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee);

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
     * @dev lock ETHs to be minted on harmony chain
     * @param amount amount of tokens to lock
     * @param recipient recipient address on the harmony chain
     */
    function lockEth(
        uint256 amount,
        address recipient
    ) public payable {
        require(
            recipient != address(0),
            "EthManager/recipient is a zero address"
        );
        require(msg.value == amount, "EthManager/zero token locked");
        emit Locked(address(ETH_ADDRESS), msg.sender, amount, recipient);
    }

    /**
     * @dev unlock ETHs after burning them on harmony chain
     * @param amount amount of unlock tokens
     * @param recipient recipient of the unlock tokens
     * @param receiptId transaction hash of the burn event on harmony chain
     */
    function unlockEth(
        uint256 amount,
        address payable recipient,
        bytes32 receiptId
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "EthManager/The burn event cannot be reused"
        );
        usedEvents_[receiptId] = true;
        recipient.transfer(amount);
        emit Unlocked(address(ETH_ADDRESS), amount, recipient, receiptId);
    }
}
