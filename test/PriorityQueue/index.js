/** Contract Artifacts */
const PriorityQueue = artifacts.require('PriorityQueue.sol')

/** Chai */
require('chai').use(require('chai-as-promised')).should()
const { expect } = require('chai')

contract("PriorityQueue", (accounts) => {
    const [
        one,
        two,
        three,
        four,
        five,
    ] = accounts

    const owner = accounts[7]
    const controller= accounts[9]

    let pQueue

    before(async () => {
        pQueue = await PriorityQueue.new(
            controller,
            {
                from: owner,
            }
        )
        expect(pQueue.address).to.exist
    })

    it('Properly handles authorized()', async () => {
        const auth = await pQueue.authorized()
        expect(auth).to.equal(controller)
    })

    it('Returns isEmpty() === true before any inserts happen', async () => {
        const empty = await pQueue.isEmpty()
        expect(empty).to.equal(true)
    })

    it('Reverts peek() while still empty', async () => {
        pQueue.peek().should.be.rejectedWith('VM Exception while processing transaction: revert')
    })

    it('Inserts values and correctly orders them', async () => {
        const valRes1 = await pQueue.insert(33, one, {from: controller})
        const valRes2 = await pQueue.insert(45, two, {from: controller})
        const valRes3 = await pQueue.insert(12, three, {from: controller})
        const valRes4 = await pQueue.insert(30, four, {from: controller})
        const valRes5 = await pQueue.insert(25, five, {from: controller})

        for (let i = 1; i < 6; i++) {
            expect(
                eval(`valRes${i}.receipt.status`)
            ).to.equal('0x01')
        }

        const res = await pQueue.peek()
        console.log(res)
    })
})