pragma solidity ^0.4.24;

import "./EIP1228.sol";
import "./test/GasTester.sol";

contract Chronos is EIP1228, GasTester {
    function execute(bytes _data)
        logGasUsed
        public returns (bool result)
    {

    }
}