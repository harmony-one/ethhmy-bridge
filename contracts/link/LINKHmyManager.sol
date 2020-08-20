pragma solidity ^0.5.0;
import "./ILINK.sol";

contract LINKHmyManager {
    ILINK public link_;

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
     * @param link token contract address on harmony chain, e.g., hrc20
     */
    constructor(ILINK link) public {
        wards[msg.sender] = 1;
        link_ = link;
    }

    /**
     * @dev burns tokens on harmony to be unlocked on ethereum
     * @param amount amount of tokens to burn
     * @param recipient recipient of the unlock tokens on ethereum
     */
    function burnToken(uint256 amount, address recipient) public {
        require(
            link_.transferFrom(msg.sender, address(this), amount),
            "HmyManager/burn failed"
        );
        emit Burned(address(link_), msg.sender, amount, recipient);
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
        require(link_.transfer(recipient, amount), "HmyManager/mint failed");
        emit Minted(amount, recipient);
    }
}
