/** Chai */
require('chai').use(require('chai-as-promised')).should();
const { expect } = require('chai');

const EventEmitter = artifacts.require('EventEmitter.sol');
const ScheduledTransactionCore = artifacts.require('ScheduledTransaction.sol');
const Scheduler = artifacts.require('Scheduler.sol');

const { encode } = require('../contracts/c--/makeData');

contract('Scheduler', () => {

  let eventEmitter;
  let scheduledTransactionCore;
  let scheduler;

  const cleanDeploy = async () => {
    eventEmitter = await EventEmitter.new();
    scheduledTransactionCore = await ScheduledTransactionCore.new();
    scheduler = await Scheduler.new(
      eventEmitter.address,
      scheduledTransactionCore.address,
  );
  }

  before(cleanDeploy);

  it('returns the correct values of public variables', async () => {
    const receivedEventEmitter = await scheduler.eventEmitter();
    const receivedScheduledTxCore = await scheduler.scheduledTxCore();

    expect(receivedEventEmitter).to.equal(eventEmitter.address);
    expect(receivedScheduledTxCore).to.equal(scheduledTransactionCore.address);
  })

  it('creates a transaction', async () => {
    const curBlock = await new Promise((resolve) => {
      web3.eth.getBlock('latest', (e,r) => {
        resolve(r);
      })
    })

    const txParams = {
      to: '0xc54083e77F913a4f99E1232Ae80c318ff03c9D17',
      gas: '3000000',
      gasPrice: web3.toWei('2', 'gwei'),
      value: 66,
      temporalUnit: 1,
      executionWindowStart: curBlock.number + 30,
      executionWindowLength: 400,
      bounty: 77,
      owner: web3.eth.accounts[0],
      data: '0x0',
    }

    const encodedParams = encode(
      txParams.to,
      txParams.gas,
      txParams.gasPrice,
      txParams.value,
      txParams.temporalUnit,
      txParams.executionWindowStart,
      txParams.executionWindowLength,
      txParams.bounty,
      txParams.owner,
      txParams.data,
    );

    const res = await scheduler.schedule(encodedParams, {
      value: web3.toWei('50', 'finney'),
      from: web3.eth.accounts[0],
      gas: 3500000
    });

    const event = await new Promise((resolve) => {
      eventEmitter.NewTransactionScheduled().get((err,res) => {
        resolve(res);
      })
    });

    const eventArgs = event[0].args;
    expect(eventArgs.scheduledBy).to.equal(web3.eth.accounts[0]);
    expect(eventArgs.scheduledFrom).to.equal(scheduler.address);
    expect(eventArgs.serializedTransaction).to.equal(encodedParams);
    const { newTransaction } = eventArgs;

    const nTx = await ScheduledTransactionCore.at(newTransaction);
    const state = await nTx.state();
    const data = await nTx.dataHash();
    expect(state.toNumber()).to.equal(1);
    // expect(data).to.equal(web3.sha3(encodedParams));

    const owner = await nTx.getOwner(encodedParams);
    console.log(owner, web3.eth.accounts[0]);
  })
})