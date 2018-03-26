const IPFS = artifacts.require('IPFS.sol')
const ScheduledTransaction = artifacts.require('ScheduledTransaction.sol')

const Serializer = require('../../scripts/serializeTransaction')

const scheduledTransactionDirectDeploy = async(opts) => {
    const sTx = await ScheduledTransaction.new()
    const input = serializer.serialize(
        opts.recipient || '0x0',
        opts.value || 0,
        opts.callGas || 0,
        opts.gasPrice || 0,
        opts.executionWindowStart || 0,
        opts.executionWindowLength || 0,
        opts.bounty || 0,
        opts.fee || 0,
    )

    const ipfs = await IPFS.new()
    const ipfsHash = await ipfs.generateHash(input.slice(2))

    await sTx.init(ipfsHash, opts.owner || '0x0', opts.schedulerFrom || '0x0')
    return sTx
}