pragma solidity ^0.4.19;

contract EventEmitter {
    event NewTransactionScheduled(address newTransaction, bytes serializedBytes, address indexed scheduledBy, address indexed scheduledFrom);
    // event Parameters(
    //     bytes2 temporalUnit,
    //     address recipient,
    //     uint256 value,
    //     uint256 callGas,
    //     uint256 gasPrice,
    //     uint256 executionWindowStart,
    //     uint256 executionWindowLength,
    //     uint256 bounty,
    //     uint256 fee,
    //     bytes callData
    // );

    function logNewTransactionScheduled(
        address _newTransaction,
        bytes _serializedBytes,
        address _scheduledBy
    )
        public
    {
        // This will log the `msg.sender` as the last indexed address so that TimeNodes can filter by where
        // the event originated from. Tries to mitigate spam attacks.
        emit NewTransactionScheduled(_newTransaction, _serializedBytes, _scheduledBy, msg.sender);
    }

    // function logParameters(
    //     bytes2 _temporalUnit,
    //     address _recipient,
    //     uint256 _value,
    //     uint256 _callGas,
    //     uint256 _gasPrice,
    //     uint256 _executionWindowStart,
    //     uint256 _executionWindowLength,
    //     uint256 _bounty,
    //     uint256 _fee,
    //     bytes _callData
    // )
    //     public
    // {
    //     Parameters(_temporalUnit, _recipient, _value, _callGas, _gasPrice, _executionWindowStart, _executionWindowLength, _bounty, _fee, _callData);
    // }
}