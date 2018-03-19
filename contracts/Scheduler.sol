pragma solidity ^0.4.20;

// import IPFS.sol
import "./ScheduledTransaction.sol";

contract Scheduler {
    function () public { revert(); }

    function schedule(string _serializedParams) 
        public payable returns (address scheduledTx)
    {
        // Deploy the ScheduledTransaction contract
        address recipient;
        uint256 value;
        uint256 callGas;
        uint256 gasPrice;
        uint256 executionWindowStart;
        uint256 executionWindowLength;
        uint256 bounty;
        uint256 fee;
        // No requiredDeposit - Use Day Token now

        assembly {
            recipient := mload(_serializedParams)
            value := mload(add(_serializedParams, 32))
            callGas := mload(add(_serializedParams, 64))
            gasPrice := mload(add(_serializedParams, 96))
            executionWindowStart := mload(add(_serializedParams, 128))
            executionWindowLength := mload(add(_serializedParams, 160))
            bounty := mload(add(_serializedParams, 192))
            fee := mload(add(_serializedParams, 224))
            // CallData = everything after this
        }

        uint endowment = value + callGas * gasPrice + bounty + fee;
        require(msg.value >= endowment);

        // bytes ipfsHash = IPFS.generateHash(_serializedParams);
        bytes memory ipfsHash;
        scheduledTx = createTransaction(ipfsHash);
        require(scheduledTx != 0x0);

        ScheduledTransaction(scheduledTx).init.value(msg.value);
        // Store in the request tracker
        NewScheduledTransaction(scheduledTx, msg.sender);
    }

    function createTransaction(bytes _hash) public returns (address) {}

    event NewScheduledTransaction(address _tx, address indexed _creator);
}
