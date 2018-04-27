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
const ConditionDestination = artifacts.require('ConditionDestination.sol')

/** Helper Scripts */
const ipfsNode = require('../../scripts/ipfsNode')
const Serializer = require('../../scripts/serializeTransaction')

/** Third party imports */
const b58 = require('base-58')
const { waitUntilBlock } = require('@digix/tempo')(web3)
const ethers = require('ethers')
const coder = new ethers.utils.AbiCoder()

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
    let conditionDestination
    
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
        conditionDestination = await ConditionDestination.new()
    })

    function splitNChars(txt, num) {
        var result = [];
        for (var i = 0; i < txt.length; i += num) {
          result.push(txt.substr(i, num));
        }
        return result;
      }

    const scheduleWithCondition = async (conditionalDest, conditionalCallData) => {
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
        const callData = "0x12345678"

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

        console.log(splitNChars(serializedParams.slice(2), 64))

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
    }

    it('getCallData', async() => {
        const method = web3.sha3("isGreater(uint256,uint256)").slice(0,10)
        const values =  coder.encode( ['uint', 'uint'], [1, 2]).slice(2)
        const conditionalCallData = method + values
        
        // const data2 = coder.encode( ['uint', 'uint'], [3, 4])
        // const joined = coder.encode(['bytes', 'bytes'], [conditionalCallData, data2])
       
        //console.log(joined)
                
        await scheduleWithCondition(conditionDestination.address, conditionalCallData)
        const newTransaction = await getLatestNewTransaction()
        const scheduledTransaction = await ScheduledTransaction.at(newTransaction)

        // const canExecute = await scheduledTransaction.getCallData(joined, 64)
        // console.log("\n")
        // console.log(canExecute)

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
        console.log("\n")
        console.log(splitNChars(data.slice(2), 64))
        
        const canExecute = await scheduledTransaction.getCallData(data, 378)
        console.log("\n")
        console.log(canExecute)
    })

    // it('confirm canExecute', async() => {
    //     const a = 5
    //     const b = 4
        
    //     const method = web3.sha3("isGreater(uint256,uint256)").slice(0,10)
    //     const values =  coder.encode( ['uint', 'uint'], [a, b]).slice(2)
    //     const conditionalCallData = method + values

    //     await scheduleWithCondition(conditionDestination.address, conditionalCallData)
    //     const newTransaction = await getLatestNewTransaction()
    //     const scheduledTransaction = await ScheduledTransaction.at(newTransaction)
        
    //     // grab the ipfsHash from the contract se we can find the data
    //     const ipfsHash = await scheduledTransaction.ipfsHash()

    //     // the hash is raw, so we need to format it
    //     const formattedHash = b58.encode(
    //         Buffer.from('1220' + ipfsHash.slice(2), 'hex')
    //     )

    //     // get the data from the ipfsNode
    //     const bytes = await ipfsNode.getString(node, formattedHash)

    //     // convert to hex and add back the '0x'
    //     const data = '0x' + bytes.toString('hex')

    //     console.log(data)

    //     const canExecute = await scheduledTransaction.getCallData(data, 322)
    //     expect(canExecute).is.true

    //     // await scheduledTransaction.execute(data, {
    //     //     from: accounts[4],
    //     //     gasPrice: decoded.gasPrice,
    //     //     gas: 3000000
    //     // }).should.be.rejectedWith('VM Exception while processing transaction: revert')
    // })

    after(async() => {
        await ipfsNode.shutdown(node)
    })
})