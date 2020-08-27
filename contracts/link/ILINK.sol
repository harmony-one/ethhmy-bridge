pragma solidity 0.5.17;

interface ILINK {
    function balanceOf(address _addr) external returns (uint256);
    function transferFrom(address from, address to, uint256 value) external returns (bool);
    function transfer(address to, uint256 value) external returns (bool);
}
