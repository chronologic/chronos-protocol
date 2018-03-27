/**
 * This testfile tests all of the invariants of cancelling a
 * ScheduledTransaction.
 */

/** Contract artifacts */
const EventEmitter = artifacts.require('EventEmitter.sol')
const IPFS = artifacts.require('IPFS.sol')
const Scheduler = artifacts.require('Scheduler.sol')
const ScheduledTransaction = artifacts.require('ScheduledTransaction.sol')

/** Helper Scripts */
const ipfsNode = require('../../scripts/ipfsNode')
const Serializer = require('../../scripts/serializeTransaction')
const { scheduledTransactionDirectDeploy,
        getBlockNumber } = require('./helpers')

/** Third party imports */
const b58 = require('base-58')
const { waitUntilBlock } = require('@digix/tempo')(web3)

/** Chai */
require('chai').use(require('chai-as-promised')).should()
const { expect } = require('chai')

/** Tests */
contract("ScheduledTransaction__cancelling", (accounts) => {

    it("Allows cancelling before the transaction has been executed", async() => {
        const blockNum = await getBlockNumber() + 30
        const { scheduledTransaction } = await scheduledTransactionDirectDeploy({
            executionWindowStart: blockNum,
            owner: accounts[5],
        })

        const cancelTx = await scheduledTransaction.cancel({
            from: accounts[5]
        })

        // TODO store the serialized bytes in the scheduledTransaction object, or as a return value
        // await scheduledTransaction.execute({
        //     from: accounts[7]
        // }).should.be.rejectedWith('VM Exception while processing transaction: revert')
    })

    it("Does not allow cancelling after the transaction has been executed", async() => {
        const blockNum = await getBlockNumber() + 30

        const callGas = 30
        const gasPrice = 40
        const value = 50
        
        // const { scheduledTransaction, serializedBytes } = await scheduledTransactionDirectDeploy({
        //     executionWindowStart: blockNum + 30,
        //     owner: accounts[5],
        //     gas: callGas,
        //     gasPrice,
        //     value,
        // })

        // await waitUntilBlock(
        //     0,
        //     blockNum + 31
        // )

        // const tx = await scheduledTransaction.execute(serializedBytes, {
        //     from: accounts[7],
        //     gas: callGas,
        //     gasPrice,
        // })


    })

    it("Does not allow cancelling if already cancelled", async() => {
        
    })

    it("Does not allow cancelling if by anyone other than owner", async() => {
        
    })
})