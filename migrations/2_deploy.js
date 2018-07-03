const fs = require('fs');

const EventEmitter = artifacts.require('EventEmitter.sol');
const ParseLib = artifacts.require('ParseLib.sol');
const ScheduledTransaction = artifacts.require('ScheduledTransaction.sol');
const Scheduler = artifacts.require('Scheduler.sol');

module.exports = (deployer) => {
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