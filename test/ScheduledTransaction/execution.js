/**
 * This testfile tests all of the invariants of execution of a ScheduledTransaction.
 * It checks that the ScheduledTransaction is only executed inside of its desired
 * execution window and at no other time. It also tests that the correct gasPrice
 * is enforced by the contract and no more or less.
 */

/** Contract Artifacts */
const EventEmitter = artifacts.require('EventEmitter.sol')
const IPFS = artifacts.require('IPFS.sol')
const Scheduler = artifacts.require('Scheduler.sol')
const ScheduledTransaction = artifacts.require('ScheduledTransaction.sol')

/** Helper Scripts */
const ipfsNode = require('../../scripts/ipfsNode')
const Serializer = require('../../scripts/TransactionSerializer')

/** Third party imports */
const b58 = require('base-58')
const { waitUntilBlock } = require('@digix/tempo')(web3)

/** Chai */
require('chai').use(require('chai-as-promised')).should()
const { expect } = require('chai')

/** Tests */
contract("ScheduledTransaction__execution", (accounts)=> {

    // contract instances
    let eventEmitter
    let ipfs
    let scheduler
    let scheduledTransactionCore
    
    // ipfsNode
    let node

    // serializer
    const serializer = new Serializer()

    // helper funcs
    const getBlockNumber = () => {
        return new Promise(resolve => {
            web3.eth.getBlockNumber((err,res) => {
                resolve(res)
            })
        })
    }
    const getLatestNewTransaction = () => {
        return new Promise(resolve => {
            eventEmitter.allEvents().get((err,res) => {
                resolve(res[res.length-1].args.newTransaction)
            })
        })
    }

    before(async() => {
        // deploy new instances of contracts
        eventEmitter = await EventEmitter.new()
        ipfs = await IPFS.new()
        scheduledTransactionCore = await ScheduledTransaction.new()
        scheduler = await Scheduler.new(
            eventEmitter.address,
            '0x0',
            ipfs.address,
            scheduledTransactionCore.address,
        )

        node = await ipfsNode.startNode()
    })

    beforeEach(async()=> {
        // schedule a new transaction
        const blockNumber = await getBlockNumber()

        // set up params
        const recipient = '0x7eD1E469fCb3EE19C0366D829e291451bE638E59'
        const value = web3.toWei('20', 'gwei')
        const callGas = 2000000
        const gasPrice = web3.toWei('2', 'gwei')
        const executionWindowStart = blockNumber + 40
        const executionWindowLength = 10
        const bounty = web3.toWei('30', 'gwei')
        const fee = web3.toWei('10', 'gwei')
        const conditionalDest = '0x0000000000000000000000000000000000000000'
        const callData = "0x" + "1337".repeat(32)
        const conditionalCallData = '0x'

        // calculate the endowment to send
        const calcEndowment = (val, cg, gp, b, f) => {
            return parseInt(val) + parseInt(cg) * parseInt(gp) + parseInt(b) + parseInt(f)
        }

        const endowment = calcEndowment(
            value,
            callGas,
            gasPrice,
            bounty,
            fee,
        )

        // serialize the params
        const serializedParams = serializer.serialize(
            1,
            recipient,
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
        )

        // use the ipfsNode to add this encoded hex string
        const actualIpfsHash = await ipfsNode.addString(
            node,
            Buffer.from(serializedParams.slice(2), 'hex')
        )

        // schedule a transaction using the serializedParams
        const tx = await scheduler.schedule(
            serializedParams,
            {
                from: accounts[2],
                value: endowment, //TODO tests which check the correct endowment is supplied
            }
        )

        expect(tx.receipt.status).to.be.oneOf(['0x01', 1])
    })

    it('fails to execute before the executionWindowStart', async() => {
        const newTransactionAddress = await getLatestNewTransaction()
        const scheduledTransaction = await ScheduledTransaction.at(newTransactionAddress)
        
        // grab the ipfsHash from the contract se we can find the data
        const ipfsHash = await scheduledTransaction.ipfsHash()

        // the hash is raw, so we need to format it
        const formattedHash = b58.encode(
            Buffer.from('1220' + ipfsHash.slice(2), 'hex')
        )

        // get the data from the ipfsNode
        const bytes = await ipfsNode.getString(node, formattedHash)

        // convert to hex and add back the '0x'
        const data = '0x' + bytes.toString('hex')
        
        // decode the data so its nice and usable for us in javascript
        const decoded = serializer.deserialize(data)


        // we go to two blocks before since the "next" block is the one we test
        await waitUntilBlock(0, decoded.executionWindowStart -2)
        expect(await getBlockNumber()).to.be.below(parseInt(decoded.executionWindowStart))

        await scheduledTransaction.execute(data, {
            from: accounts[4],
            gasPrice: decoded.gasPrice,
            gas: 3000000
        }).should.be.rejectedWith('VM Exception while processing transaction: revert')
    })

    it('succeeds to execute at the executionWindowStart', async() => {
        const newTransactionAddress = await getLatestNewTransaction()
        const scheduledTransaction = await ScheduledTransaction.at(newTransactionAddress)
        
        // grab the ipfsHash from the contract se we can find the data
        const ipfsHash = await scheduledTransaction.ipfsHash()

        // the hash is raw, so we need to format it
        const formattedHash = b58.encode(
            Buffer.from('1220' + ipfsHash.slice(2), 'hex')
        )

        // get the data from the ipfsNode
        const bytes = await ipfsNode.getString(node, formattedHash)

        // convert to hex and add back the '0x'
        const data = '0x' + bytes.toString('hex')
        
        // decode the data so its nice and usable for us in javascript
        const decoded = serializer.deserialize(data)

        // we go to one block before since the "next" block is the one we test
        await waitUntilBlock(0, decoded.executionWindowStart -1)
        expect(await getBlockNumber()).to.be.below(parseInt(decoded.executionWindowStart))

        const tx = await scheduledTransaction.execute(data, {
            from: accounts[4],
            gasPrice: decoded.gasPrice,
            gas: 3000000
        })

        expect(tx.receipt.status).to.be.oneOf(['0x01', 1])
    })

    it('succeeds to execute at the last block in execution window', async() => {
        const newTransactionAddress = await getLatestNewTransaction()
        const scheduledTransaction = await ScheduledTransaction.at(newTransactionAddress)
        
        // grab the ipfsHash from the contract se we can find the data
        const ipfsHash = await scheduledTransaction.ipfsHash()

        // the hash is raw, so we need to format it
        const formattedHash = b58.encode(
            Buffer.from('1220' + ipfsHash.slice(2), 'hex')
        )

        // get the data from the ipfsNode
        const bytes = await ipfsNode.getString(node, formattedHash)

        // convert to hex and add back the '0x'
        const data = '0x' + bytes.toString('hex')
        
        // decode the data so its nice and usable for us in javascript
        const decoded = serializer.deserialize(data)

        // we go to two block before the end since we test the next block
        await waitUntilBlock(0, parseInt(decoded.executionWindowStart) + parseInt(decoded.executionWindowLength) -2)
        expect(await getBlockNumber()).to.be.above(parseInt(decoded.executionWindowStart))

        const tx = await scheduledTransaction.execute(data, {
            from: accounts[4],
            gasPrice: decoded.gasPrice,
            gas: 3000000
        })

        expect(tx.receipt.status).to.be.oneOf(['0x01', 1])
    })

    it('fails to execute after the execution window', async() => {
        const newTransactionAddress = await getLatestNewTransaction()
        const scheduledTransaction = await ScheduledTransaction.at(newTransactionAddress)
        
        // grab the ipfsHash from the contract se we can find the data
        const ipfsHash = await scheduledTransaction.ipfsHash()

        // the hash is raw, so we need to format it
        const formattedHash = b58.encode(
            Buffer.from('1220' + ipfsHash.slice(2), 'hex')
        )

        // get the data from the ipfsNode
        const bytes = await ipfsNode.getString(node, formattedHash)

        // convert to hex and add back the '0x'
        const data = '0x' + bytes.toString('hex')
        
        // decode the data so its nice and usable for us in javascript
        const decoded = serializer.deserialize(data)

        // we go to one block before the end since we test the next block
        await waitUntilBlock(0, parseInt(decoded.executionWindowStart) + parseInt(decoded.executionWindowLength) -1)
        expect(await getBlockNumber()).to.be.above(parseInt(decoded.executionWindowStart))

        await scheduledTransaction.execute(data, {
            from: accounts[4],
            gasPrice: decoded.gasPrice,
            gas: 3000000
        }).should.be.rejectedWith('VM Exception while processing transaction: revert')
    })

    it('fails to execute with the incorrect GasPrice', async() => {
        const newTransactionAddress = await getLatestNewTransaction()
        const scheduledTransaction = await ScheduledTransaction.at(newTransactionAddress)
        
        // grab the ipfsHash from the contract se we can find the data
        const ipfsHash = await scheduledTransaction.ipfsHash()

        // the hash is raw, so we need to format it
        const formattedHash = b58.encode(
            Buffer.from('1220' + ipfsHash.slice(2), 'hex')
        )

        // get the data from the ipfsNode
        const bytes = await ipfsNode.getString(node, formattedHash)

        // convert to hex and add back the '0x'
        const data = '0x' + bytes.toString('hex')
        
        // decode the data so its nice and usable for us in javascript
        const decoded = serializer.deserialize(data)

        // we go to two blocks before since the "next" block is the one we test
        await waitUntilBlock(0, decoded.executionWindowStart)
        expect(await getBlockNumber()).to.equal(parseInt(decoded.executionWindowStart))

        // Too big gasPrice
        await scheduledTransaction.execute(data, {
            from: accounts[4],
            gasPrice: decoded.gasPrice +1,
            gas: 3000000
        }).should.be.rejectedWith('VM Exception while processing transaction: revert')

        // Too small gasPrice
        await scheduledTransaction.execute(data, {
            from: accounts[4],
            gasPrice: decoded.gasPrice -1,
            gas: 3000000
        }).should.be.rejectedWith('VM Exception while processing transaction: revert')
    })

    after(async() => {
        await ipfsNode.shutdown(node)
    })
})