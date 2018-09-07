pragma solidity ^0.4.24;

contract EIP1228 {
    function execute(bytes memory _data) public returns (bool result);
    function canExecute() public view returns (bool result);
}
