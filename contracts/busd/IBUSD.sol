pragma solidity 0.5.17;

interface IBUSD {
    function balanceOf(address _addr) external returns (uint256);
    function transferFrom(address _from, address _to, uint256 _value) external returns (bool);
    function transfer(address _to, uint256 _value) external returns (bool);
    function increaseSupply(uint256 _value) external returns (bool success);
    function decreaseSupply(uint256 _value) external returns (bool success);
}
