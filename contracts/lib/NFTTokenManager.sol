pragma solidity 0.5.17;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/ownership/Ownable.sol";
import "./BridgedNFTToken.sol";

contract NFTTokenManager is Ownable {
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
     * @param name name of the token
     * @param symbol of the token
     * @param baseURI of the token
     * @return mintAddress of the mapped token
     */
    function addToken(
        address ethTokenAddr,
        string memory name,
        string memory symbol,
        string memory baseURI
    ) public auth returns (address) {
        require(
            ethTokenAddr != address(0),
            "TokenManager/ethToken is a zero address"
        );
        require(
            mappedTokens[ethTokenAddr] == address(0),
            "TokenManager/ethToken already mapped"
        );

        BridgedNFTToken bridgedToken = new BridgedNFTToken(
            ethTokenAddr,
            name,
            symbol,
            baseURI
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
        require(
            BridgedNFTToken(mappedTokens[ethTokenAddr]).checkSupply(supply),
            "TokenManager/remove has non-zero supply"
        );
        delete mappedTokens[ethTokenAddr];
    }
}
