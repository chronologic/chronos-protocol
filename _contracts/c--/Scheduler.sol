pragma solidity ^0.4.24;

import "./EventEmitter.sol";

import "@optionality.io/clone-factory/contracts/CloneFactory.sol";

contract Scheduler is CloneFactory {
    function () payable { revert("Fallback function not available."); }

    address public eventEmitter;
    address public scheduledTxCore;

    function Scheduler(
        address _eventEmitter,
        address _scheduledTxCore
    ) public {
        eventEmitter = _eventEmitter;
        scheduledTxCore = _scheduledTxCore;
    }

    function scheduled(bytes _serializedTransaction)
        public payable returns (address scheduledTx)
    {
        uint256 bounty;
        uint256 fee;
        uint256 gas;
        uint256 gasPrice;
        uint256 value;

        assembly {
            value := mload(add(_serializedTransaction, 96))
            callGas := mload(add(_serializedTransaction, 128))
            gasPrice := mload(add(_serializedTransaction, 160))
            bounty := mload(add(_serializedTransaction, 256))
            fee := mload(add(_serializedTransaction, 288))
        }

        uint256 endowment = (gas * gasPrice) + bounty + fee + value;
        require(msg.value >= endowment);

        bytes32 txHash = keccak256(_serializedTransaction);

        scheduledTx = createTransaction();
        require(scheduledTx != address(0x0));

        ScheduledTransaction(scheduledTx).initialize.value(msg.value)(

        );

        require(
            EventEmitter(eventEmitter).emitNewTransactionScheduled(
                scheduledTx,
                msg.sender,
                _serializedTransaction
            )
        );
    }

    function createTransaction() public returns (address) {
        return createClone(scheduledTxCore);
    }
}