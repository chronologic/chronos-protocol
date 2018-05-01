const ethers = require('ethers')
const coder = new ethers.utils.AbiCoder()

const TransactionSerializer = function () {}

/**
 * Uint256 - TemporalUnit
 * Address - Recipient
 * Uint256 - Value
 * Uint256 - CallGas
 * Uint256 - GasPrice
 * Uint256 - ExecutionWindowStart
 * Uint256 - ExecutionWindowLength
 * Uint256 - Bounty
 * Uint256 - Fee
 * Address - ConditionalDestination
 * Bytes   - CallData
 * Bytes   - ConditionalCallData
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
    conditionalDest,
    callData,
    conditionalCallData
) => {
    return coder.encode(
        [
            'uint256',
            'address',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'address',
            'bytes',
            'bytes'
        ],
        [
            temporalUnit,
            recipientAddress,
            value,
            callGas,
            gasPrice,
            executionWindowStart,
            executionWindowLength,
            bounty,
            fee,
            conditionalDest,
            callData,
            conditionalCallData
        ]
    )
}

TransactionSerializer.prototype.deserialize = (byteString) => {
    const decoded = coder.decode(
        [
            'uint256',
            'address',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'address',
            'bytes',
            'bytes',
        ],
        byteString
    )

    return {
        temporalUnit: decoded[0].toNumber(),
        recipient: decoded[1],
        value: decoded[2].toNumber(),
        callGas: decoded[3].toNumber(),
        gasPrice: decoded[4].toNumber(),
        executionWindowStart: decoded[5].toNumber(),
        executionWindowLength: decoded[6].toNumber(),
        bounty: decoded[7].toNumber(),
        fee: decoded[8].toNumber(),
        conditionalDest: decoded[9],
        callData: decoded[10],
        conditionalCallData: decoded[11],
    }
}

const testEncodingWithShortCallData = () => {
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
        '0x7eD1E469fCb3EE19C0366D829e291451bE638E59',
        '0x12341234',
        '0x12341234'
    )

    return serialized
}

const testEncodingWithLongCallData = () => {
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
        '0x7eD1E469fCb3EE19C0366D829e291451bE638E59',
        '0x' + '69123477'.repeat(20),
        '0x' + '69123477'.repeat(20)
    )

    return serialized
}

const testDecoding = () => {
    const transactionSerializer = new TransactionSerializer()
    const serialized = testEncodingWithLongCallData()
    const deserialized = transactionSerializer.deserialize(serialized)
    return deserialized
}

// console.log(testEncodingWithShortCallData())
// console.log(testEncodingWithLongCallData())
// console.log(testDecoding())

module.exports = TransactionSerializer