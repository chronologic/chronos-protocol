const EventEmitter = artifacts.require('EventEmitter.sol')
const IPFS = artifacts.require('IPFS.sol')
const Scheduler = artifacts.require('Scheduler.sol')
const ScheduledTransaction = artifacts.require('ScheduledTransaction.sol')

const ipfsNode = require('../../scripts/ipfsNode')
const Serializer = require('../../scripts/serializeTransaction')

const b58 = require('base-58')

contract("Scheduler", (accounts) => {
    let eventEmitter
    let ipfs
    let scheduler
    let scheduledTxCore

    // ipfsNode
    let node

    before(async() => {
        eventEmitter = await EventEmitter.new()
        ipfs = await IPFS.new()
        scheduledTxCore = await ScheduledTransaction.new()
        scheduler = await Scheduler.new(eventEmitter.address, '0x0', ipfs.address, scheduledTxCore.address)

        node = await ipfsNode.startNode()
    })

    it('successfully deployed', async() => {
        assert(eventEmitter.address)
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
        const callData = "0x" + "1337".repeat(32)

        // serialize params
        const encoded = serializer.serialize(
            1,
            recipient,
            value,
            callGas,
            gasPrice,
            executionWindowStart,
            executionWindowLength,
            bounty,
            fee,
            callData,
        )

        // use our running IPFS node to add this encoded hex string (minus the 0x)
        const expectedIpfsHash = await ipfsNode.addString(node, Buffer.from(encoded.slice(2), 'hex'))


        // console.log(encoded)
        // schedule a call using the same encoded hex string
        const tx = await scheduler.schedule(encoded, {value: 30000})

        const getEvent = () => {
            return new Promise(resolve => {
                eventEmitter.allEvents().get((err,res) => {
                    resolve(res[0].args)
                })
            })
        }

        const log = await getEvent()
        // console.log(log)

        // find the logs containing the newly scheduled contract
        const newTxAddr = log.newTransaction

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

        // console.log(encoded)
        // console.log(data)
    })

    after(async() => {
        await ipfsNode.shutdown(node)
    })
})