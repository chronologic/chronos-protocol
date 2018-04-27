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
const Serializer = require('../../scripts/serializeTransaction')

/** Third party imports */
const ethers = require('ethers')
const coder = new ethers.utils.AbiCoder()

/** Chai */
require('chai').use(require('chai-as-promised')).should()
const { expect } = require('chai')

/** Tests */
contract('ScheduledTransaction__canExecute', (accounts) => {
  // contract instances
  let eventEmitter
  let ipfs
  let scheduler
  let scheduledTransactionCore
  let conditionDestination

  // serializer
  const serializer = new Serializer()

  // helper funcs
  const getBlockNumber = () => new Promise((resolve) => {
    web3.eth.getBlockNumber((err, res) => {
      resolve(res)
    })
  })
  const getLatestNewTransaction = () => new Promise((resolve) => {
    eventEmitter.allEvents().get((err, res) => {
      resolve(res[res.length - 1].args.newTransaction)
    })
  })

  before(async () => {
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
    conditionDestination = await ConditionDestination.new()
  })

  const scheduleWithCondition = async(conditionDest, conditionCallData) => {
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
    const callData = '0x12345678'

    // calculate the endowment to send
    const calcEndowment = (val, cg, gp, b, f) => parseInt(val) + parseInt(cg) * parseInt(gp) + parseInt(b) + parseInt(f)

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
      conditionDest,
      callData,
      conditionCallData
    )

    // schedule a transaction using the serializedParams
    const tx = await scheduler.schedule(
      serializedParams,
      {
        from: accounts[2],
        value: endowment, // TODO tests which check the correct endowment is supplied
      }
    )

    expect(tx.receipt.status).to.be.oneOf(['0x01', 1])

    return serializedParams
  }

  const deployConditionalTransaction = async (conditionCallData, conditionAddress) => {
    const scheduleArguments = await scheduleWithCondition(conditionAddress || conditionDestination.address, conditionCallData)
    const newTransaction = await getLatestNewTransaction()
    const scheduledTransaction = await ScheduledTransaction.at(newTransaction)

    return scheduledTransaction.canExecute(scheduleArguments)
  }

  const encodeMethod = (signature) => {
      return web3.sha3(signature).slice(0, 10)
  }

  const encodeIsGreater = (a, b) => {
    const method = encodeMethod('isGreater(uint256,uint256)')
    const values = coder.encode(['uint', 'uint'], [a, b]).slice(2)
    return method + values
  }

  const encodeInRange = (v, l, r) => {
    const method = encodeMethod('inRange(uint256,uint256,uint256)')
    const values = coder.encode(['uint', 'uint', 'uint'], [v, l, r]).slice(2)
    return method + values
  }

  it('canExecute is true as deafult when no condition has been set', async () => {
    const result = await deployConditionalTransaction('0x', '0x0000000000000000000000000000000000000000')

    expect(result).to.be.true
  })

  it('canExecute is true when 5 > 4', async () => {
    const a = 5
    const b = 4

    const result = await deployConditionalTransaction(encodeIsGreater(a, b))

    expect(result).to.be.true
  })

  it('canExecute is false when 4 > 5', async () => {
    const a = 4
    const b = 5

    const result = await deployConditionalTransaction(encodeIsGreater(a, b))

    expect(result).to.be.false
  })

  it('canExecute is true when 3 < 4 < 5', async () => {
    const v = 4
    const l = 3
    const r = 5

    const result = await deployConditionalTransaction(encodeInRange(v, l, r))

    expect(result).to.be.true
  })

  it('canExecute is true when 3 < 10 < 5', async () => {
    const v = 10
    const l = 3
    const r = 5

    const result = await deployConditionalTransaction(encodeInRange(v, l, r))

    expect(result).to.be.false
  })
})
