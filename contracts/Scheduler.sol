pragma solidity ^0.4.19;

import "./CloneFactory.sol";
import "./EventEmitter.sol";
import "./IPFS.sol";
import "./ScheduledTransaction.sol";

contract Scheduler is CloneFactory {
    function () public {revert();}

    address public eventEmitter;
    address public feeRecipient;
    address public ipfs;
    address public scheduledTxCore;

    function Scheduler(
        address _eventEmitter,
        address _feeRecipient,
        address _ipfsLib,
        address _scheduledTxCore
    ) public {
        eventEmitter = _eventEmitter;
        feeRecipient = _feeRecipient;
        ipfs = _ipfsLib;
        scheduledTxCore = _scheduledTxCore;
    }

    function schedule(bytes _serializedTransaction) 
        public payable returns (address scheduledTx)
    {
        uint256 value;
        uint256 callGas;
        uint256 gasPrice;
        uint256 bounty;
        uint256 fee;

        assembly {
            value := mload(add(_serializedTransaction, 66))
            callGas := mload(add(_serializedTransaction, 98))
            gasPrice := mload(add(_serializedTransaction, 130))
            bounty := mload(add(_serializedTransaction, 226))
            fee := mload(add(_serializedTransaction, 258))
        }

        uint endowment = value + callGas * gasPrice + bounty + fee;
        require(msg.value >= endowment);

        bytes32 ipfsHash = IPFS(ipfs).generateHash(_serializedTransaction);

        scheduledTx = createTransaction();
        require(scheduledTx != 0x0);

        ScheduledTransaction(scheduledTx).init.value(msg.value)(ipfsHash, msg.sender, address(this), address(0x17B17026C423a988C3D1375252C3021ff32F354C));

        // Record on the event emitter
        EventEmitter(eventEmitter).logNewTransactionScheduled(scheduledTx, _serializedTransaction, msg.sender);
    }

    function createTransaction() public returns (address) {
        return createClone(scheduledTxCore);
    }
}
