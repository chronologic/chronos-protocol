const ethers = require('ethers')
const coder = new ethers.utils.AbiCoder()

const TransactionSerializer = function () {}

/**
 * Address - Recipient
 * Uint256 - Value
 * Uint256 - CallGas
 * Uint256 - GasPrice
 * Uint256 - ExecutionWindowStart
 * Uint256 - ExecutionWindowLength
 * Uint256 - Bounty
 * Uint256 - Fee
 */
TransactionSerializer.prototype.serialize = (
    recipientAddress,
    value,
    callGas,
    gasPrice,
    executionWindowStart,
    executionWindowLength,
    bounty,
    fee,
) => {
    const encodedTransaction = coder.encode(
        [
            'address',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
        ],
        [
            recipientAddress,
            value,
            callGas,
            gasPrice,
            executionWindowStart,
            executionWindowLength,
            bounty,
            fee,
        ]
    )
    return encodedTransaction
}

const testTransactionSerializer = () => {
    const transactionSerializer = new TransactionSerializer()
    const serialized = transactionSerializer.serialize(
        '0x7eD1E469fCb3EE19C0366D829e291451bE638E59',
        10,
        20,
        30,
        40,
        50,
        60,
        70,
    )

    console.log(serialized)
}

testTransactionSerializer()