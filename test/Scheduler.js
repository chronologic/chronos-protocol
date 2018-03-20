const IPFS = artifacts.require('IPFS.sol')
const Scheduler = artifacts.require('Scheduler.sol')
const ScheduledTransaction = artifacts.require('ScheduledTransaction.sol')

const ipfsNode = require('../scripts/ipfsNode')
const Serializer = require('../scripts/serializeTransaction')

const b58 = require('base-58')

contract("Scheduler", (accounts) => {
    let ipfs
    let scheduler
    let scheduledTxCore

    // ipfsNode
    let node

    before(async() => {
        ipfs = await IPFS.new()
        scheduledTxCore = await ScheduledTransaction.new()
        scheduler = await Scheduler.new(ipfs.address, scheduledTxCore.address)

        node = await ipfsNode.startNode()
    })

    it('successfully deployed', async() => {
        assert(ipfs.address)
        assert(scheduledTxCore.address)
        assert(scheduler.address)
    })

    it('schedules', async() => {
        const serializer = new Serializer()
        const encoded = serializer.serialize(
            '0x7eD1E469fCb3EE19C0366D829e291451bE638E59',
            10,
            20,
            30,
            40,
            50,
            60,
            70,
        )
        const hash = await ipfsNode.addString(node, Buffer.from(encoded.slice(2), 'hex'))
        // console.log(hash)
        const tx = await scheduler.schedule(encoded)
        // console.log(tx.logs[0])
        // console.log(tx.logs[1].args)
        // console.log(b58.encode(Buffer.from('1220' + tx.logs[2].args._part.slice(2), 'hex')))
        const newTx = tx.logs.find(log => log.event === 'NewScheduledTransaction')
        const newTxAddr = newTx.args.tx
        const n = await ScheduledTransaction.at(newTxAddr)
        const res = await n.ipfsHash()
        console.log(res)
    })

    after(async() => {
        await ipfsNode.shutdown(node)
    })
})