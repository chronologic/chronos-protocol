pragma solidity ^0.4.24;

contract EIP1228 {
    function execute(bytes _data) returns (bool result);
    function canExecute() view returns (bool result);
}
