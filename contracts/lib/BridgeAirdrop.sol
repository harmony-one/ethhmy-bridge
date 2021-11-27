pragma solidity ^0.5.0;

import "@openzeppelin/contracts/ownership/Ownable.sol";

contract BridgeAirdrop is Ownable {
    mapping(address => bool) public members;
    mapping(bytes32 => bool) public txHistory;

    function () external payable {}

    function rely(address guy) external onlyOwner {
        members[guy] = true;
    }

    function deny(address guy) external onlyOwner {
        require(guy != owner(), "BridgeAirdrop/cannot deny the owner");
        members[guy] = false;
    }

    modifier auth {
        require((members[msg.sender] == true || msg.sender == owner()), "BridgeAirdrop/not-authorized");
        _;
    }


    function dispatch(address guy, uint256 amount, bytes32 receiptId) public auth {
        require(
            !txHistory[receiptId],
            "BridgeAirdrop/The lock event cannot be reused"
        );

        // send some ONE
        (bool success, ) = guy.call.value(amount)("");
        require(success, "BridgeAirdrop/Dispatch failed.");

        txHistory[receiptId] = true;
    }

    function withdraw(address guy, uint256 amount) public onlyOwner {
        (bool success, ) = guy.call.value(amount)("");
        require(success, "BridgeAirdrop/Withdraw failed.");
    }
}
