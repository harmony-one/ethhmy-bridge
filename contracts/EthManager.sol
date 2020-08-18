pragma solidity ^0.5.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract EthManager {
    using SafeERC20 for IERC20;
    IERC20 public ethToken_;

    mapping(bytes32 => bool) public usedEvents_;

    event Locked(
        address indexed token,
        address indexed sender,
        uint256 amount,
        address recipient
    );

    event Unlocked(uint256 amount, address recipient);

    mapping(address => uint256) public wards;

    function rely(address guy) external auth {
        wards[guy] = 1;
    }

    function deny(address guy) external auth {
        wards[guy] = 0;
    }

    modifier auth {
        require(wards[msg.sender] == 1, "EthManager/not-authorized");
        _;
    }

    /**
    * @dev constructor
    * @param ethToken token contract address, e.g., erc20 contract
    */
    constructor(IERC20 ethToken) public {
        wards[msg.sender] = 1;
        ethToken_ = ethToken;
    }

    /**
    * @dev lock tokens to be minted on harmony chain
    * @param amount amount of tokens to lock
    * @param recipient recipient address on the harmony chain
    */
    function lockToken(uint256 amount, address recipient) public {
        ethToken_.safeTransferFrom(msg.sender, address(this), amount);
        emit Locked(address(ethToken_), msg.sender, amount, recipient);
    }

    /**
    * @dev unlock tokens after burning them on harmony chain
    * @param amount amount of unlock tokens
    * @param recipient recipient of the unlock tokens
    * @param receiptId transaction hash of the burn event on harmony chain
    */
    function unlockToken(
        uint256 amount,
        address recipient,
        bytes32 receiptId
    ) public auth {
        require(!usedEvents_[receiptId], "The burn event cannot be reused");
        usedEvents_[receiptId] = true;
        ethToken_.safeTransfer(recipient, amount);
        emit Unlocked(amount, recipient);
    }
}
