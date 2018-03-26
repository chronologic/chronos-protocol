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

/** Third party imports */
const b58 = require('base-58')
const { waitUntilBlock } = require('@digix/tempo')(web3)

/** Chai */
require('chai').use(require('chai-as-promised')).should()
const { expect } = require('chai')

/** Tests */
contract("ScheduledTransaction__cancelling", (accounts) => {

    // serializer
    const serializer = new Serializer()

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
})