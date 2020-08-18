pragma solidity ^0.5.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./MyERC20.sol";

interface MyERC20Like {
    function mint(address beneficiary, uint256 amount) external;
    function burn(address beneficiary, uint256 amount) external;
}

contract HmyManager {
    MyERC20Like public oneToken_;

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
    * @param oneToken token contract address on harmony chain, e.g., hrc20
    */
    constructor(address oneToken) public {
        wards[msg.sender] = 1;
        oneToken_ = MyERC20Like(oneToken);
    }

    /**
    * @dev burns tokens on harmony to be unlocked on ethereum
    * @param amount amount of tokens to burn
    * @param recipient recipient of the unlock tokens on ethereum
    */
    function burnToken(uint256 amount, address recipient) public {
        oneToken_.burn(msg.sender, amount);
        emit Burned(address(oneToken_), msg.sender, amount, recipient);
    }

    /**
    * @dev mints tokens corresponding to the tokens locked in the ethereum chain
    * @param amount amount of tokens for minting
    * @param recipient recipient of the minted tokens (harmony address)
    * @param receiptId transaction hash of the lock event on ethereum chain
    */
    function mintToken(uint256 amount, address recipient, bytes32 receiptId) public auth {
        require(!usedEvents_[receiptId], "The unlock event cannot be reused");
        usedEvents_[receiptId] = true;
        oneToken_.mint(recipient, amount);
        emit Minted(amount, recipient);
    }
}
