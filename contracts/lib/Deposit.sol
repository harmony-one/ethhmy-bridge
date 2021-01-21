pragma solidity 0.5.17;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";

contract Deposit is Ownable {
    using SafeMath for uint256;
    mapping (address => uint256) private balances;

    event Deposited(
        address indexed sender,
        uint256 amount
    );

    event Returned(
        address indexed recipient,
        uint256 amount
    );

    address public wallet;
    modifier onlyWallet {
        require(msg.sender == wallet, "Deposit/not-authorized");
        _;
    }

    /**
     * @dev constructor
     * @param _wallet is the multisig wallet
     */
    constructor(address _wallet) public {
        wallet = _wallet;
    }

    /**
     * @dev deposit to contract
     * @param amount to deposit
     */
    function deposit(uint256 amount) public payable {
        require(msg.value == amount, "Deposit/insufficient-value");
        balances[msg.sender] = balances[msg.sender].add(amount);
        emit Deposited(msg.sender, amount);
    }

    /**
     * @dev return to recipient
     * @param recipient of the amount
     * @param amount to be returned
     */
    function withdraw(address payable recipient, uint256 amount) public onlyWallet {
        require(
            recipient != address(0),
            "Deposit/recipient is a zero address"
        );
        require(amount <= balances[recipient], "Deposit/in-sufficient-balance");
        recipient.transfer(amount);
        balances[recipient] = balances[recipient].sub(amount);
        emit Returned(recipient, amount);
    }

    /**
     * @dev payout the balance to owner
     */
    function payout() public onlyOwner {
        msg.sender.transfer(address(this).balance);
    }
}