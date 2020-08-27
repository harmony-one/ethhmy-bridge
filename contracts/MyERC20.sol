pragma solidity 0.5.17;
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";

contract MyERC20 is ERC20 {
    mapping(address => uint256) public wards;

    function rely(address guy) external auth {
        wards[guy] = 1;
    }

    function deny(address guy) external auth {
        wards[guy] = 0;
    }

    modifier auth {
        require(wards[msg.sender] == 1, "MyERC20/not-authorized");
        _;
    }

    constructor() public {
        wards[msg.sender] = 1;
    }

    function mint(address beneficiary, uint256 amount) public auth {
        _mint(beneficiary, amount);
    }

    function burn(address beneficiary, uint256 amount) public auth {
        _burn(beneficiary, amount);
    }
}
