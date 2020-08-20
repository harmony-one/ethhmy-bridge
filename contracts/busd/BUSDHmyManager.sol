pragma solidity ^0.5.0;
import "./IBUSD.sol";

contract BUSDHmyManager {
    IBUSD public busd_;

    mapping(bytes32 => bool) public usedEvents_;

    event Burned(
        address indexed token,
        address indexed sender,
        uint256 amount,
        address recipient
    );

    event Minted(uint256 amount, address recipient);

    mapping(address => uint256) public wards;

    function rely(address guy) external auth {
        wards[guy] = 1;
    }

    function deny(address guy) external auth {
        wards[guy] = 0;
    }

    modifier auth {
        require(wards[msg.sender] == 1, "HmyManager/not-authorized");
        _;
    }

    /**
     * @dev constructor
     * @param busd token contract address on harmony chain, e.g., hrc20
     */
    constructor(IBUSD busd) public {
        wards[msg.sender] = 1;
        busd_ = busd;
    }

    /**
     * @dev burns tokens on harmony to be unlocked on ethereum
     * @param amount amount of tokens to burn
     * @param recipient recipient of the unlock tokens on ethereum
     */
    function burnToken(uint256 amount, address recipient) public {
        require(
            busd_.transferFrom(msg.sender, address(this), amount),
            "HmyManager/could not transfer tokens from user"
        );
        require(busd_.decreaseSupply(amount), "HmyManager/burn failed");
        emit Burned(address(busd_), msg.sender, amount, recipient);
    }

    /**
     * @dev mints tokens corresponding to the tokens locked in the ethereum chain
     * @param amount amount of tokens for minting
     * @param recipient recipient of the minted tokens (harmony address)
     * @param receiptId transaction hash of the lock event on ethereum chain
     */
    function mintToken(
        uint256 amount,
        address recipient,
        bytes32 receiptId
    ) public auth {
        require(
            !usedEvents_[receiptId],
            "HmyManager/The unlock event cannot be reused"
        );
        usedEvents_[receiptId] = true;
        require(busd_.increaseSupply(amount), "HmyManager/mint failed");
        require(
            busd_.transfer(recipient, amount),
            "HmyManager/transfer after mint failed"
        );
        emit Minted(amount, recipient);
    }
}
