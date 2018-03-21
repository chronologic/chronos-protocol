pragma solidity ^0.4.19;

contract EventEmitter {
    event NewTransactionScheduled(address newTransaction, address indexed scheduledBy);
    event Parameters(
        address recipient,
        uint256 value,
        uint256 callGas,
        uint256 gasPrice,
        uint256 executionWindowStart,
        uint256 executionWindowLength,
        uint256 bounty,
        uint256 fee
    );

    function logNewTransactionScheduled(
        address _newTransaction,
        address _scheduledBy
    )
        public
    {
        emit NewTransactionScheduled(_newTransaction, _scheduledBy);
    }

    function logParameters(
        address _recipient,
        uint256 _value,
        uint256 _callGas,
        uint256 _gasPrice,
        uint256 _executionWindowStart,
        uint256 _executionWindowLength,
        uint256 _bounty,
        uint256 _fee
    )
        public
    {
        emit Parameters(_recipient, _value, _callGas, _gasPrice, _executionWindowStart, _executionWindowLength, _bounty, _fee);
    }
}