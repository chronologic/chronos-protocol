pragma solidity ^0.4.24;

contract EventEmitter {
    event NewTransactionScheduled(
        address newTransaction,
        address indexed scheduledBy,
        address indexed scheduledFrom,
        bytes serializedTransaction
    );

    function emitNewTransactionScheduled(
        address _newTransaction,
        address _scheduledBy,
        bytes _serializedTransaction
    ) public returns (bool success) {
        emit NewTransactionScheduled(
            _newTransaction,
            _scheduledBy,
            msg.sender,
            _serializedTransaction
        );
        success = true;
    }
}