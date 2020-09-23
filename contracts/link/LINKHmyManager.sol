pragma solidity 0.5.17;

import "./ILINK.sol";
import "../lib/TokenManager.sol";

contract LINKHmyManager {
    ILINK public hLINK;

    mapping(bytes32 => bool) public usedEvents_;

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

    mapping(address => uint256) public wards;

    function rely(address guy) external auth {
        wards[guy] = 1;
    }

    function deny(address guy) external auth {
        require(guy != owner, "HmyManager/cannot deny the owner");
        wards[guy] = 0;
    }

    modifier auth {
        require(wards[msg.sender] == 1, "HmyManager/not-authorized");
        _;
    }

    address public owner;

    uint16 public threshold;
    mapping(bytes32 => uint16) confirmations;

    /**
     * @dev constructor
     * @param _hLINK harmony token contract address
     */
    constructor(ILINK _hLINK) public {
        owner = msg.sender;
        wards[owner] = 1;
        hLINK = _hLINK;
        threshold = 1;
    }

    /**
     * @dev change threshold requirement
     * @param newTheshold new threshold requirement
     */
    function changeThreshold(uint16 newTheshold) public {
        require(
            msg.sender == owner,
            "HmyManager/only owner can change threshold"
        );
        threshold = newTheshold;
    }

    /**
     * @dev register token mapping in the token manager
     * @param tokenManager token manager contract address
     * @param eLINK ethereum token contract address
     */
    function register(address tokenManager, address eLINK) public auth {
        TokenManager(tokenManager).registerToken(eLINK, address(hLINK));
    }

    /**
     * @dev deregister token mapping in the token manager
     * @param tokenManager token manager contract address
     * @param eLINK ethereum token contract address
     */
    function deregister(address tokenManager, address eLINK) public auth {
        TokenManager(tokenManager).removeToken(eLINK, 10**27);
    }

    /**
     * @dev burns tokens on harmony to be unlocked on ethereum
     * @param amount amount of tokens to burn
     * @param recipient recipient of the unlock tokens on ethereum
     */
    function burnToken(uint256 amount, address recipient) public {
        require(
            hLINK.transferFrom(msg.sender, address(this), amount),
            "HmyManager/burn failed"
        );
        emit Burned(address(hLINK), msg.sender, amount, recipient);
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
        confirmations[receiptId] = confirmations[receiptId] + 1;
        if (confirmations[receiptId] < threshold) {
            return;
        }
        require(
            !usedEvents_[receiptId],
            "HmyManager/The unlock event cannot be reused"
        );
        usedEvents_[receiptId] = true;
        require(hLINK.transfer(recipient, amount), "HmyManager/mint failed");
        emit Minted(address(hLINK), amount, recipient, receiptId);
        // delete confirmations entry for receiptId
        delete confirmations[receiptId];
    }
}
