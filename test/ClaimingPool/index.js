const ClaimingPool = artifacts.require('ClaimingPool.sol')
const StandardTokenMock = artifacts.require('./helpers/StandardTokenMock.sol')

/** Third party imports */
const { waitUntilBlock } = require('@digix/tempo')(web3)

/** Chai */
require('chai').use(require('chai-as-promised')).should()
const { expect } = require('chai')

contract("ClaimingPool", (accounts) => {
    let operator = accounts[3]

    let claimingPool
    let dayToken

    it('deploys', async () => {
        dayToken = await StandardTokenMock.new()
        expect((await dayToken.balanceOf(accounts[0])).toNumber()).to.equal(1000000)
        claimingPool = await ClaimingPool.new(
            dayToken.address,
            {from: operator}
        )
    })

    it('checks all public variables', async () => {
        const op = await claimingPool.operator()
        expect(op).to.equal(operator)

        const dToken = await claimingPool.dayToken()
        expect(dToken).to.equal(dayToken.address)

        const slashedDay = await claimingPool.slashedDay()
        expect(slashedDay.toNumber()).to.equal(0)
    })

    it('allows a deposit of some day', async () => {
        await dayToken.transfer(accounts[6], 60000, {from: accounts[0]})
        expect((await dayToken.balanceOf(accounts[6])).toNumber()).to.equal(60000)
        await dayToken.approve(claimingPool.address, 33, {from: accounts[6]})
        const tx = await claimingPool.depositDay({from: accounts[6]})
        expect(tx.receipt.status).to.be.oneOf(['0x01', 1])
        expect((await dayToken.balanceOf(accounts[6])).toNumber()).to.equal(60000 - 33)
        expect((await dayToken.balanceOf(claimingPool.address)).toNumber()).to.equal(33)
        const hasDeposited = await claimingPool.hasDeposited(accounts[6])
        expect(hasDeposited).to.equal(true)
    })

    it('calculates the correct range values for `canClaim', async () => {
        const totSupply = await dayToken.totalSupply()
        const firstCalc = await claimingPool.calcFrequency(60000, totSupply)
        const secondCalc = await claimingPool.calcFrequency(totSupply, totSupply)
        expect(firstCalc.toNumber()).to.equal(38)
        expect(secondCalc.toNumber()).to.equal(2)
    })

    it('DOES NOT allow claim before frequency window opens', async () => {
        
    })

    it('DOES allow claim after frequency window opens', async () => {

    })

    it('DOES NOT allow claim while waiting for frequency window', async () => {
        
    })

    it('removes a TimeNode and allows for re-deposit', async () => {
        
    })

})