const ClaimingPool = artifacts.require('ClaimingPool.sol')
const EventEmitter = artifacts.require('EventEmitter.sol')
const IPFS = artifacts.require('IPFS.sol')
const ScheduledTransaction = artifacts.require('ScheduledTransaction.sol')
const Scheduler = artifacts.require('Scheduler.sol')

module.exports = (deployer) => {
    deployer.deploy(IPFS)
    .then(() => {
        return deployer.deploy(EventEmitter)
    })
    .then(() => {
        return deployer.deploy(ScheduledTransaction)
    })
    .then(() => {
        return deployer.deploy(
            Scheduler,
            EventEmitter.address,
            "0xCCa19CC61a0B6F5B40525FB3d37124D40b877EF6",
            IPFS.address,
            ScheduledTransaction.address,
        )
    })
    .then(() => {
        const fs = require('fs')
        fs.writeFileSync('build/a.json', JSON.stringify({
            eventEmitter: EventEmitter.address,
            scheduler: Scheduler.address,
        }))
    })
}