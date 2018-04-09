const IPFS = artifacts.require('IPFS.sol')
const ScheduledTransaction = artifacts.require('ScheduledTransaction.sol')

const Serializer = require('../../scripts/serializeTransaction')

const scheduledTransactionDirectDeploy = async(opts) => {
    const serializer = new Serializer()

    const sTx = await ScheduledTransaction.new()
    const input = serializer.serialize(
        opts.temporalUnit || 1,
        opts.recipient || '0x17B17026C423a988C3D1375252C3021ff32F354C',
        opts.value || 0,
        opts.callGas || 0,
        opts.gasPrice || 0,
        opts.executionWindowStart || 0,
        opts.executionWindowLength || 0,
        opts.bounty || 0,
        opts.fee || 0,
        opts.callData || "0x" + "1337".repeat(32),
    )

    const ipfs = await IPFS.new()
    const ipfsHash = await ipfs.generateHash(input.slice(2))

    await sTx.init(ipfsHash, opts.owner || '0x0', opts.scheduledFrom || '0x0', opts.claimingPool || '0x0')
    return {
        scheduledTransaction: sTx,
        serializedBytes: input,
    }
}

const getBlockNumber = () => {
    return new Promise(resolve => {
        web3.eth.getBlockNumber((err,res) => {
            resolve(res)
        })
    })
}

module.exports = {
    scheduledTransactionDirectDeploy,
    getBlockNumber
}