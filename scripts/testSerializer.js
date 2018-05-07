/**
 * testSerializer.js
 * A rather "incomplete" suite of test scripts merely to demonstrate how to use
 * the TransactionSerializer class and how it returns data.
 */
const TransactionSerializer = require('./TransactionSerializer')

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