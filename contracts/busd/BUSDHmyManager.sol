pragma solidity 0.5.17;

import "./IBUSD.sol";
import "../lib/TokenManager.sol";

contract BUSDHmyManager {
    IBUSD public hBUSD;

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
     * @param _hBUSD harmony busd token contract address
     * @param _wallet is the multisig wallet
     */
    constructor(IBUSD _hBUSD, address _wallet) public {
        hBUSD = _hBUSD;
        wallet = _wallet;
    }

    /**
     * @dev register token mapping in the token manager
     * @param tokenManager address to token manager
     * @param eBUSD address of the ethereum token
     */
    function register(address tokenManager, address eBUSD) public onlyWallet {
        TokenManager(tokenManager).registerToken(eBUSD, address(hBUSD));
    }

    /**
     * @dev deregister token mapping in the token manager
     * @param tokenManager address to token manager
     * @param eBUSD address of the ethereum token
     */
    function deregister(address tokenManager, address eBUSD) public onlyWallet {
        TokenManager(tokenManager).removeToken(eBUSD, 0);
    }

    /**
     * @dev burns tokens on harmony to be unlocked on ethereum
     * @param amount amount of tokens to burn
     * @param recipient recipient of the unlock tokens on ethereum
     */
    function burnToken(uint256 amount, address recipient) public {
        require(
            hBUSD.transferFrom(msg.sender, address(this), amount),
            "HmyManager/could not transfer tokens from user"
        );
        require(hBUSD.decreaseSupply(amount), "HmyManager/burn failed");
        emit Burned(address(hBUSD), msg.sender, amount, recipient);
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
            "HmyManager/The lock event cannot be reused"
        );
        usedEvents_[receiptId] = true;
        require(hBUSD.increaseSupply(amount), "HmyManager/mint failed");
        require(
            hBUSD.transfer(recipient, amount),
            "HmyManager/transfer after mint failed"
        );
        emit Minted(address(hBUSD), amount, recipient, receiptId);
    }
}
