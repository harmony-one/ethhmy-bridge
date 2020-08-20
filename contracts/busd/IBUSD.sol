pragma solidity ^0.5.0;

interface IBUSD {
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool);
    function transfer(address _to, uint256 _value) external returns (bool);
    function increaseSupply(uint256 _value) external returns (bool success);
    function decreaseSupply(uint256 _value) external returns (bool success);
}
