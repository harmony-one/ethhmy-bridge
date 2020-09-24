pragma solidity 0.5.17;

import "./IBUSD.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

contract BUSDEthManager {
    using SafeMath for uint256;

    IBUSD public busd_;

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
     * @param busd token contract address, e.g., erc20 contract
     * @param _wallet is the multisig wallet
     */
    constructor(IBUSD busd, address _wallet) public {
        busd_ = busd;
        wallet = _wallet;
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
        uint256 _balanceBefore = busd_.balanceOf(msg.sender);
        require(
            busd_.transferFrom(msg.sender, address(this), amount),
            "EthManager/lock failed"
        );
        uint256 _balanceAfter = busd_.balanceOf(msg.sender);
        uint256 _actualAmount = _balanceBefore.sub(_balanceAfter);
        emit Locked(address(busd_), msg.sender, _actualAmount, recipient);
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
    ) public onlyWallet {
        require(
            recipient != address(0),
            "EthManager/recipient is a zero address"
        );
        require(amount > 0, "EthManager/zero token locked");
        uint256 _balanceBefore = busd_.balanceOf(userAddr);
        require(
            busd_.transferFrom(userAddr, address(this), amount),
            "EthManager/lock failed"
        );
        uint256 _balanceAfter = busd_.balanceOf(userAddr);
        uint256 _actualAmount = _balanceBefore.sub(_balanceAfter);
        emit Locked(address(busd_), userAddr, _actualAmount, recipient);
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
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "EthManager/The burn event cannot be reused"
        );
        usedEvents_[receiptId] = true;
        require(busd_.transfer(recipient, amount), "EthManager/unlock failed");
        emit Unlocked(address(busd_), amount, recipient, receiptId);
    }
}
