pragma solidity 0.5.17;

import "./ILINK.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract LINKEthManager {
    using SafeMath for uint256;

    ILINK public link_;

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

    mapping(address => uint256) public wards;

    function rely(address guy) external auth {
        wards[guy] = 1;
    }

    function deny(address guy) external auth {
        require(guy != owner, "EthManager/cannot deny the owner");
        wards[guy] = 0;
    }

    modifier auth {
        require(wards[msg.sender] == 1, "EthManager/not-authorized");
        _;
    }

    address public owner;

    uint16 public threshold;
    mapping(bytes32 => uint16) confirmations;

    /**
     * @dev constructor
     * @param link token contract address, e.g., erc20 contract
     */
    constructor(ILINK link) public {
        owner = msg.sender;
        wards[owner] = 1;
        link_ = link;
        threshold = 1;
    }

    /**
     * @dev change threshold requirement
     * @param newTheshold new threshold requirement
     */
    function changeThreshold(uint16 newTheshold) public {
        require(msg.sender == owner, "EthManager/only owner can change threshold");
        threshold = newTheshold;
    }

    /**
     * @dev lock tokens to be minted on harmony chain
     * @param amount amount of tokens to lock
     * @param recipient recipient address on the harmony chain
     */
    function lockToken(uint256 amount, address recipient) public {
        require(
            recipient != address(0),
            "EthManager/recipient is a zero address"
        );
        require(amount > 0, "EthManager/zero token locked");
        uint256 _balanceBefore = link_.balanceOf(msg.sender);
        require(
            link_.transferFrom(msg.sender, address(this), amount),
            "EthManager/lock failed"
        );
        uint256 _balanceAfter = link_.balanceOf(msg.sender);
        uint256 _actualAmount = _balanceBefore.sub(_balanceAfter);
        emit Locked(address(link_), msg.sender, _actualAmount, recipient);
    }

    /**
     * @dev lock tokens for an user address to be minted on harmony chain
     * @param amount amount of tokens to lock
     * @param recipient recipient address on the harmony chain
     */
    function lockTokenFor(
        address userAddr,
        uint256 amount,
        address recipient
    ) public auth {
        require(
            recipient != address(0),
            "EthManager/recipient is a zero address"
        );
        require(amount > 0, "EthManager/zero token locked");
        uint256 _balanceBefore = link_.balanceOf(userAddr);
        require(
            link_.transferFrom(userAddr, address(this), amount),
            "EthManager/lock failed"
        );
        uint256 _balanceAfter = link_.balanceOf(userAddr);
        uint256 _actualAmount = _balanceBefore.sub(_balanceAfter);
        emit Locked(address(link_), userAddr, _actualAmount, recipient);
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
        confirmations[receiptId] = confirmations[receiptId] + 1;
        if (confirmations[receiptId] < threshold) {
            return;
        }
        require(
            !usedEvents_[receiptId],
            "EthManager/The burn event cannot be reused"
        );
        usedEvents_[receiptId] = true;
        require(link_.transfer(recipient, amount), "EthManager/unlock failed");
        emit Unlocked(address(link_), amount, recipient, receiptId);
        // delete confirmations entry for receiptId
        delete confirmations[receiptId];
    }
}
