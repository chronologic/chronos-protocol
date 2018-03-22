const EventEmitter = artifacts.require('EventEmitter.sol')
const IPFS = artifacts.require('IPFS.sol')
const Scheduler = artifacts.require('Scheduler.sol')
const ScheduledTransaction = artifacts.require('ScheduledTransaction.sol')

const ipfsNode = require('../scripts/ipfsNode')
const Serializer = require('../scripts/serializeTransaction')

const b58 = require('base-58')

contract('ScheduledTransaction', () => {
    let eventEmitter
    let ipfs
    let scheduler 
    let scheduledTxCore

    // ipfsNode
    let node

    before(async() => {
        // set up contracts and ipfsNode
        eventEmitter = await EventEmitter.new()
        ipfs = await IPFS.new()
        scheduledTxCore = await ScheduledTransaction.new()
        scheduler = await Scheduler.new(
            eventEmitter.address,
            '0x0',
            ipfs.address,
            scheduledTxCore.address
        )

        node = await ipfsNode.startNode()
    })

    it('successfully deployed', async() => {
        assert(eventEmitter.address)
        assert(ipfs.address)
        assert(scheduledTxCore.address)
        assert(scheduler.address)
        assert(ipfs.address == await scheduler.ipfs())
        assert(eventEmitter.address == await scheduler.eventEmitter())
        assert(scheduledTxCore.address == await scheduler.scheduledTxCore())
    })

    after(async() => {
        await ipfsNode.shutdown(node)
    })

})