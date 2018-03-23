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

TransactionSerializer.prototype.deserialize = (
    bytesString
) => {
    const decoded = coder.decode(
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
        bytesString,
    )
    
    const r = {
        recipient: decoded[0],
        value: decoded[1].toNumber(),
        callGas: decoded[2].toNumber(),
        gasPrice: decoded[3].toNumber(),
        executionWindowStart: decoded[4].toNumber(),
        executionWindowLength: decoded[5].toNumber(),
        bounty: decoded[6].toNumber(),
        fee: decoded[7].toNumber(),
    }
    
    return r
}

const testEncoding = () => {
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

    return serialized
}

const testDecoding = () => {
    const transactionSerializer = new TransactionSerializer()
    const serialized = testEncoding()
    const deserialized = transactionSerializer.deserialize(serialized)
    return deserialized
}

// console.log(testEncoding())
// console.log(testDecoding())

module.exports = TransactionSerializer