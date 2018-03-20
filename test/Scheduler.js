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
        // serializer is a utility to serialize the parameters to schedule
        // an EACv2 call into an ABI encoded hex string 
        const serializer = new Serializer()

        // set up params
        const recipient = '0x7eD1E469fCb3EE19C0366D829e291451bE638E59'
        const value = 10
        const callGas = 20
        const gasPrice = 30
        const executionWindowStart = 40
        const executionWindowLength = 50
        const bounty = 60
        const fee = 70

        // serialize params
        const encoded = serializer.serialize(
            recipient,
            value,
            callGas,
            gasPrice,
            executionWindowStart,
            executionWindowLength,
            bounty,
            fee,
        )

        // use our running IPFS node to add this encoded hex string (minus the 0x)
        const expectedIpfsHash = await ipfsNode.addString(node, Buffer.from(encoded.slice(2), 'hex'))

        // schedule a call using the same encoded hex string
        const tx = await scheduler.schedule(encoded)

        // find the logs containing the newly scheduled contract
        const newTx = tx.logs.find(log => log.event === 'NewScheduledTransaction')
        const newTxAddr = newTx.args.tx

        // init the ScheduledTransaction wrapper on this address
        const n = await ScheduledTransaction.at(newTxAddr)

        // grab the ipfsHash
        const res = await n.ipfsHash()

        // format it 
        const receivedHash = b58.encode(Buffer.from('1220' + res.slice(2), 'hex'))

        // make sure they match
        assert(expectedIpfsHash === receivedHash)

        // get the bytes back
        const result = await ipfsNode.getString(node, receivedHash)

        // convert to hex and add back the `0x`
        const data = '0x' + result.toString('hex')

        // now the encoded data should be the same as the data we got back from the contract
        assert(encoded === data)

        console.log(encoded)
        console.log(data)
    })

    after(async() => {
        await ipfsNode.shutdown(node)
    })
})