const fs = require('fs');

// 0 - Chronos Offchain
// 1 - Chronos Onchain
const DEPLOY_TYPE = 0;

// Chronos Offchain
const c1 = artifacts.require('C.sol');

// Chronos Onchain
const EventEmitter = artifacts.require('EventEmitter.sol');
const ParseLib = artifacts.require('ParseLib.sol');
const ScheduledTransaction = artifacts.require('ScheduledTransaction.sol');
const Scheduler = artifacts.require('Scheduler.sol');

module.exports = (deployer) => {
  if (DEPLOY_TYPE === 0) {
    deployer.deploy(c1);
  } else {
    deployer.deploy(ParseLib)
    .then(() => {
      deployer.link(ParseLib, ScheduledTransaction);
      return deployer.deploy(ScheduledTransaction);
    })
    .then(() => {
      return deployer.deploy(EventEmitter);
    })
    .then(() => {
      return deployer.deploy(Scheduler, EventEmitter.address, ScheduledTransaction.address);
    })
    .then(() => {
      fs.writeFileSync('deployed.json', JSON.stringify({
        eventEmitter: EventEmitter.address,
        parseLib: ParseLib.address,
        scheduledTransactionCore: ScheduledTransaction.address,
        scheduler: Scheduler.address,
      }));
    })
  }
}