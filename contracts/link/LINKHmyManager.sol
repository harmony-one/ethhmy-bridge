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

    address public wallet;
    modifier onlyWallet {
        require(msg.sender == wallet, "HmyManager/not-authorized");
        _;
    }

    /**
     * @dev constructor
     * @param _hLINK harmony token contract address
     * @param _wallet is the multisig wallet
     */
    constructor(ILINK _hLINK, address _wallet) public {
        hLINK = _hLINK;
        wallet = _wallet;
    }

    /**
     * @dev register token mapping in the token manager
     * @param tokenManager token manager contract address
     * @param eLINK ethereum token contract address
     */
    function register(address tokenManager, address eLINK) public onlyWallet {
        TokenManager(tokenManager).registerToken(eLINK, address(hLINK));
    }

    /**
     * @dev deregister token mapping in the token manager
     * @param tokenManager token manager contract address
     * @param eLINK ethereum token contract address
     */
    function deregister(address tokenManager, address eLINK) public onlyWallet {
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
    ) public onlyWallet {
        require(
            !usedEvents_[receiptId],
            "HmyManager/The unlock event cannot be reused"
        );
        usedEvents_[receiptId] = true;
        require(hLINK.transfer(recipient, amount), "HmyManager/mint failed");
        emit Minted(address(hLINK), amount, recipient, receiptId);
    }
}
