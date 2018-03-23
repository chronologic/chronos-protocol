const EventEmitter = artifacts.require('EventEmitter.sol')
const IPFS = artifacts.require('IPFS.sol')
const Scheduler = artifacts.require('Scheduler.sol')
const ScheduledTransaction = artifacts.require('ScheduledTransaction.sol')

const ipfsNode = require('../scripts/ipfsNode')
const Serializer = require('../scripts/serializeTransaction')

const b58 = require('base-58')
const { waitUntilBlock } = require('@digix/tempo')(web3)

contract('ScheduledTransaction', (accounts) => {
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

    it('schedules a new transactions', async() => {
        const serializer = new Serializer()

        const blockNumber = await new Promise(resolve => {
            web3.eth.getBlockNumber((err,res) => {
                resolve(res)
            })
        })

        // console.log(blockNumber + 40)

        const recipient = '0x7eD1E469fCb3EE19C0366D829e291451bE638E59'
        const value = 10
        const callGas = 20
        const gasPrice = 30
        const executionWindowStart = blockNumber + 40
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
        const tx = await scheduler.schedule(encoded, {value: 30000})

        const getEvent = () => {
            return new Promise(resolve => {
                eventEmitter.allEvents().get((err,res) => {
                    // console.log(res)
                    resolve(res[0].args)
                })
            })
        }

        const log = await getEvent()

        // find the logs containing the newly scheduled contract
        const newTxAddr = log.newTransaction

        // init the ScheduledTransaction wrapper on this address
        const scheduledTransaction = await ScheduledTransaction.at(newTxAddr)

        // grab the ipfsHash
        const txIpfsHash = await scheduledTransaction.ipfsHash()

        // format it 
        const receivedHash = b58.encode(Buffer.from('1220' + txIpfsHash.slice(2), 'hex'))

        // make sure they match
        assert(expectedIpfsHash === receivedHash)

        // get the bytes back
        const result = await ipfsNode.getString(node, receivedHash)

        // convert to hex and add back the `0x`
        const data = '0x' + result.toString('hex')

        // now the encoded data should be the same as the data we got back from the contract
        assert(encoded === data)

        /// DECODING

        // decodes the encoded data
        const decoded = serializer.deserialize(data)
        
        // wait until the windowStart
        await waitUntilBlock(0, decoded.executionWindowStart)

        assert(await scheduledTransaction.executed() == false)

        const a = await scheduledTransaction.execute(data, {
            from: accounts[3], 
            gasPrice: decoded.gasPrice, 
            gas: 3000000
        })

        console.log(a)
        console.log(await scheduledTransaction.executed())

    })

    after(async() => {
        await ipfsNode.shutdown(node)
    })

})