pragma solidity ^0.4.24;

import "./EventEmitter.sol";
import "./ScheduledTransaction.sol";

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

    // event Debug(uint256 _a, uint256 _b, uint256 _c, uint256 _d);
    // event Debug(uint256 a, uint256 b);

    function schedule(bytes _serializedTransaction)
        public payable returns (address scheduledTx)
    {
        uint256 bounty;
        uint256 callGas;
        uint256 gasPrice;
        uint256 value;

        assembly {
            callGas := mload(add(_serializedTransaction, 0x40))
            gasPrice := mload(add(_serializedTransaction, 0x60))
            value := mload(add(_serializedTransaction, 0x80))
            bounty := mload(add(_serializedTransaction, 0x100))
        }

        uint256 endowment = (callGas * gasPrice) + bounty + value;
        // emit Debug(endowment, msg.value);
        // emit Debug(callGas, gasPrice, bounty, value);
        require(msg.value >= endowment);

        bytes32 txHash = keccak256(_serializedTransaction);

        scheduledTx = createTransaction();
        require(scheduledTx != address(0x0));

        ScheduledTransaction(scheduledTx).initialize.value(msg.value)(
            txHash
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