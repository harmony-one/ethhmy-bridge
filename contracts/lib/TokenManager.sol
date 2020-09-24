pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./BridgedToken.sol";

contract TokenManager is Ownable {
    // ethtoken to onetoken mapping
    mapping(address => address) public mappedTokens;

    event TokenMapAck(address indexed tokenReq, address indexed tokenAck);

    mapping(address => uint256) public wards;

    function rely(address guy) external onlyOwner {
        wards[guy] = 1;
    }

    function deny(address guy) external onlyOwner {
        require(guy != owner(), "TokenManager/cannot deny the owner");
        wards[guy] = 0;
    }

    // both owner and admin must approve
    modifier auth {
        require(wards[msg.sender] == 1, "TokenManager/not-authorized");
        _;
    }

    /**
     * @dev map ethereum token to harmony token and emit mintAddress
     * @param ethTokenAddr address of the ethereum token
     * @return mintAddress of the mapped token
     */
    function addToken(
        address ethTokenAddr,
        string memory name,
        string memory symbol,
        uint8 decimals
    ) public auth returns (address) {
        require(
            ethTokenAddr != address(0),
            "TokenManager/ethToken is a zero address"
        );
        require(
            mappedTokens[ethTokenAddr] == address(0),
            "TokenManager/ethToken already mapped"
        );

        BridgedToken bridgedToken = new BridgedToken(
            ethTokenAddr,
            name,
            symbol,
            decimals
        );
        address bridgedTokenAddr = address(bridgedToken);

        // store the mapping and created address
        mappedTokens[ethTokenAddr] = bridgedTokenAddr;

        // assign minter role to the caller
        bridgedToken.addMinter(msg.sender);

        emit TokenMapAck(ethTokenAddr, bridgedTokenAddr);
        return bridgedTokenAddr;
    }

    /**
     * @dev register an ethereum token to harmony token mapping
     * @param ethTokenAddr address of the ethereum token
     * @return oneToken of the mapped harmony token
     */
    function registerToken(address ethTokenAddr, address oneTokenAddr)
        public
        auth
        returns (bool)
    {
        require(
            ethTokenAddr != address(0),
            "TokenManager/ethTokenAddr is a zero address"
        );
        require(
            mappedTokens[ethTokenAddr] == address(0),
            "TokenManager/ethTokenAddr already mapped"
        );

        // store the mapping and created address
        mappedTokens[ethTokenAddr] = oneTokenAddr;
    }

    /**
     * @dev remove an existing token mapping
     * @param ethTokenAddr address of the ethereum token
     * @param supply only allow removing mapping when supply, e.g., zero or 10**27
     */
    function removeToken(address ethTokenAddr, uint256 supply) public auth {
        require(
            mappedTokens[ethTokenAddr] != address(0),
            "TokenManager/ethToken mapping does not exists"
        );
        IERC20 oneToken = IERC20(mappedTokens[ethTokenAddr]);
        require(
            oneToken.totalSupply() == supply,
            "TokenManager/remove has non-zero supply"
        );
        delete mappedTokens[ethTokenAddr];
    }
}
