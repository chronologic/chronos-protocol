pragma solidity ^0.4.19;

import "./IPFS.sol";
import "./Scheduler.sol";

contract ScheduledTransaction {
    bytes32 public ipfsHash;
    address public scheduledFrom;

    address public owner = 0x0;

    // will switch to true when initialized (prevents re-initialization)
    bool public initialized = false;
    
    // will switch to true when claimed
    bool public claimed = false;
    address public claimingNode = 0x0;

    // will switch to true when executed
    bool public executed = false;

    // will switch to true if successful
    bool public successful = false;

    // will switch to true if cancelled
    bool public cancelled = false;

    // disallow receiving ether
    function() public {revert();}

    function init(
        bytes32 _ipfsHash,
        address _owner,
        address _scheduledFrom
    ) public payable {
        require(!initialized);
        ipfsHash = _ipfsHash;
        owner = _owner;
        scheduledFrom = _scheduledFrom;
        initialized = true;
    }

    function checkHash(bytes _s)
        public constant returns (bool)
    {
        bytes32 checkHash = IPFS(Scheduler(scheduledFrom).ipfs()).generateHash(_s);
        return checkHash == ipfsHash;
    }

    function execute(bytes _serializedTransaction)
        public returns (bool)
    {
        // uint256 startGas = msg.gas;
        require(checkHash(_serializedTransaction));

        address recipient;
        uint256 value;
        uint256 callGas;
        uint256 gasPrice;
        uint256 executionWindowStart;
        uint256 executionWindowLength;
        uint256 bounty;
        uint256 fee;

        assembly {
            recipient := mload(add(_serializedTransaction, 32))
            value := mload(add(_serializedTransaction,64))
            callGas := mload(add(_serializedTransaction, 96))
            gasPrice := mload(add(_serializedTransaction, 128))
            executionWindowStart := mload(add(_serializedTransaction, 160))
            executionWindowLength := mload(add(_serializedTransaction, 192))
            bounty := mload(add(_serializedTransaction, 224))
            fee := mload(add(_serializedTransaction, 256))
            // CallData = everything after this
        }

        bytes32 callData = "";

        // check gasleft() >= requiredGas
        require(msg.gas >= callGas + 180000 - 25000);
        // check that this hasn't been executed yet
        require(!executed);
        // check in execution window
        require(block.number >= executionWindowStart && block.number < executionWindowStart + executionWindowLength);
        // if claimed, check that claimer is executed
        if (claimed && block.number < executionWindowStart + executionWindowLength / 2) {
            require(msg.sender == claimingNode);
        }
        // check gasPrice
        require(tx.gasprice == gasPrice);

        // mark that this has been executed
        executed = true;

        successful = recipient.call.value(value).gas(callGas)(callData);

        // check bounty recipient, send bounty
        address bountyRecipient = msg.sender;
        bountyRecipient.transfer(bounty);

        //  check fee recipient, send fee
        address feeRecipient = Scheduler(scheduledFrom).feeRecipient();
        if (feeRecipient != 0x0) {
            feeRecipient.transfer(fee);
        }
        
        // send remaining ether back to scheduler
        owner.transfer(address(this).balance); //todo more checks on this

        return true;
    }

    function cancel()
        public returns (bool)
    {
        // check if msg.sender == owner
        require(msg.sender == owner);
        require(initialized);
        require(!cancelled);
        require(!executed);
        cancelled = true;
        owner.transfer(address(this).balance);
        return true;
    }

    // function claim()
    //     public returns (bool)
    // {
    //     return true;
    // }

    function proxy(address _to, bytes _data)
        public payable returns (bool)
    {
        require(msg.sender == owner);
        require(executed); // make sure this is the only check we need
        return _to.call.value(msg.value)(_data);
    }

    // pull transactions?
}