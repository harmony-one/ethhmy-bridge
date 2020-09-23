pragma solidity 0.5.17;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../lib/TokenManager.sol";

interface MintableToken {
    function mint(address beneficiary, uint256 amount) external returns (bool);
}

interface BurnableToken {
    function burnFrom(address account, uint256 amount) external;
}

contract HmyManager {
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

    mapping(address => address) public mappings;

    uint16 public threshold;
    mapping(bytes32 => uint16) confirmations;

    /**
     * @dev constructor
     */
    constructor() public {
        owner = msg.sender;
        wards[owner] = 1;
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
     * @dev map an ethereum token to harmony
     * @param tokenManager address to token manager
     * @param ethTokenAddr ethereum token address to map
     * @param name of the ethereum token
     * @param symbol of the ethereum token
     * @param decimals of the ethereum token
     */
    function addToken(
        address tokenManager,
        address ethTokenAddr,
        string memory name,
        string memory symbol,
        uint8 decimals
    ) public {
        address oneTokenAddr = TokenManager(tokenManager).addToken(
            ethTokenAddr,
            name,
            symbol,
            decimals
        );
        mappings[ethTokenAddr] = oneTokenAddr;
    }

    /**
     * @dev deregister token mapping in the token manager
     * @param tokenManager address to token manager
     * @param ethTokenAddr address to remove token
     */
    function removeToken(address tokenManager, address ethTokenAddr) public {
        TokenManager(tokenManager).removeToken(ethTokenAddr, 0);
    }

    /**
     * @dev burns tokens on harmony to be unlocked on ethereum
     * @param oneToken harmony token address
     * @param amount amount of tokens to burn
     * @param recipient recipient of the unlock tokens on ethereum
     */
    function burnToken(
        address oneToken,
        uint256 amount,
        address recipient
    ) public {
        BurnableToken(oneToken).burnFrom(msg.sender, amount);
        emit Burned(oneToken, msg.sender, amount, recipient);
    }

    /**
     * @dev mints tokens corresponding to the tokens locked in the ethereum chain
     * @param oneToken is the token address for minting
     * @param amount amount of tokens for minting
     * @param recipient recipient of the minted tokens (harmony address)
     * @param receiptId transaction hash of the lock event on ethereum chain
     */
    function mintToken(
        address oneToken,
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
            "HmyManager/The lock event cannot be reused"
        );
        usedEvents_[receiptId] = true;
        MintableToken(oneToken).mint(recipient, amount);
        emit Minted(oneToken, amount, recipient, receiptId);
        // delete confirmations entry for receiptId
        delete confirmations[receiptId];
    }
}
