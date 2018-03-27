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
    temporalUnit,
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
    const temporalUnitEncoded = temporalUnit == 1 ? '0001' : '0002'
    return '0x' + temporalUnitEncoded + encodedTransaction.slice(2)
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
        '0x' + bytesString.slice(6), // take off the temporal unit
    )

    const decodedTemporalUnit = bytesString.slice(2, 6) == '0001' ? 1 : 2
    
    const r = {
        temporalUnit: decodedTemporalUnit,
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
        2,
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
console.log(testDecoding())

module.exports = TransactionSerializer