/**
 * ClaimElection/index.js
 * 
 * Tests the claim election mechanism for Timenodes. In breif, Timenodes
 * enter in to queue to claim the next available transaction by
 * submitting some amount of Day token as a bond. These bonds are
 * sorted by the amount of Day that is staked and are used as 
 * incentives for the Timenode to stay online. If the Timenode
 * goes offline and fails to execute the claimed transaction, they
 * lose a portion of their bond.
 */

/** Contract Artifacts */
const ClaimElection = artifacts.require('ClaimElection.sol')
const PriorityQueue = artifacts.require('PriorityQueue.sol')
const StdToken = artifacts.require('StandardTokenMock.sol')

/** Chai Assertion */
require('chai').use(require('chai-as-promised')).should()
const { expect } = require('chai')

/** Mocha Tests */
contract('ClaimElection', (accounts) => {
    const [
        owner,
        tokenController,
        timenode1,
        timenode2,
    ] = accounts

    let claimElection
    let pQueue
    let stdToken

    before(async() => {
        claimElection = await ClaimElection.new({from: owner})
        pQueue = await PriorityQueue.at(
            await claimElection.pQueue()
        )
        stdToken = await StdToken.new({from: tokenController})

        // Sanity checks
        expect(claimElection.address).to.exist
        expect(pQueue.address).to.exist

        expect(await pQueue.authorized()).to.equal(
            claimElection.address
        )

        expect((await stdToken.balanceOf(tokenController)).toString()).to.equal(
            (await stdToken.totalSupply()).toString()
        )
    })

    it('Allows the owner to set the token', async () => {
        // Should be set to NULL_ADDRESS before being set manually.
        expect(await claimElection.token()).to.equal(
            '0x' + '0'.repeat(40),
        )

        // Owner successfully sets the token.
        const txRes = await claimElection.setToken(
            stdToken.address,
            {from: owner},
        )
        expect(txRes.receipt.status).to.equal('0x01')

        // Disallows anyone else from setting the token,
        // in this case, even the controller of the token.
        await claimElection.setToken(
            '0x0',
            {from: tokenController},
        ).should.be.rejectedWith('VM Exception while processing transaction: revert')

        // Sanity check
        expect(await claimElection.token()).to.equal(
            stdToken.address,
        )
    })

    it("Allows a timenode to submit bonds", async () => {
        // First fund a timenode.
        await stdToken.transfer(timenode1, 333, {from: tokenController})
        expect((await stdToken.balanceOf(timenode1)).toNumber()) .to.equal(333)

        // This timenode will submit three bonds with values [122, 55, 156]
        //
        // First, approve the token transfer...
        await stdToken.approve(claimElection.address, 333, {from: timenode1})
        //
        // Submit the first bond.
        await claimElection.joinQueue(122, {from: timenode1})
        const peek1 = await pQueue.peek()
        expect(peek1[0].toNumber()).to.equal(122)
        expect(peek1[1]).to.equal(timenode1)
        //
        // Submit the second bond.
        await claimElection.joinQueue(55, {from: timenode1})
        const getIndex1 = await pQueue.getAtIndex(1)
        expect(getIndex1[0].toNumber()).to.equal(55)
        expect(getIndex1[1]).to.equal(timenode1)
        //
        // Submit the third bond.
        await claimElection.joinQueue(156, {from:timenode1})
        const peek2 = await pQueue.peek()
        expect(peek2[0].toNumber()).to.equal(156)
        expect(peek2[1]).to.equal(timenode1)
        //
    })
})