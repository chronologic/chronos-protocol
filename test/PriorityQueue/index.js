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
        six,
    ] = accounts

    const owner = accounts[7]
    const controller= accounts[9]

    let pQueue

    before(async () => {
        pQueue = await PriorityQueue.new({
            from: controller,
        })
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
        const valRes6 = await pQueue.insert(67, six, {from: controller})

        for (let i = 1; i < 6; i++) {
            expect(
                eval(`valRes${i}.receipt.status`)
            ).to.equal('0x01')
        }


        console.log(
            '0 | ' + await pQueue.getAtIndex(0) + '\n' +
            '1 | ' + await pQueue.getAtIndex(1) + '\n' +
            '2 | ' + await pQueue.getAtIndex(2) + '\n' +
            '3 | ' + await pQueue.getAtIndex(3) + '\n' +
            '4 | ' + await pQueue.getAtIndex(4) + '\n' +
            '5 | ' + await pQueue.getAtIndex(5) + '\n' +
            '6 | ' + await pQueue.getAtIndex(6) + '\n' +
            '7 | ' + await pQueue.getAtIndex(7) + '\n' 
        )

        await pQueue.pop({from: controller})
        console.log('POP!')

        console.log(
            '0 | ' + await pQueue.getAtIndex(0) + '\n' +
            '1 | ' + await pQueue.getAtIndex(1) + '\n' +
            '2 | ' + await pQueue.getAtIndex(2) + '\n' +
            '3 | ' + await pQueue.getAtIndex(3) + '\n' +
            '4 | ' + await pQueue.getAtIndex(4) + '\n' +
            '5 | ' + await pQueue.getAtIndex(5) + '\n' +
            '6 | ' + await pQueue.getAtIndex(6) + '\n' +
            '7 | ' + await pQueue.getAtIndex(7) + '\n' 
        )


        await pQueue.pop({from: controller})
        console.log('POP!')

        console.log(
            '0 | ' + await pQueue.getAtIndex(0) + '\n' +
            '1 | ' + await pQueue.getAtIndex(1) + '\n' +
            '2 | ' + await pQueue.getAtIndex(2) + '\n' +
            '3 | ' + await pQueue.getAtIndex(3) + '\n' +
            '4 | ' + await pQueue.getAtIndex(4) + '\n' +
            '5 | ' + await pQueue.getAtIndex(5) + '\n' +
            '6 | ' + await pQueue.getAtIndex(6) + '\n' +
            '7 | ' + await pQueue.getAtIndex(7) + '\n' 
        )


        await pQueue.pop({from: controller})
        console.log('POP!')

        console.log(
            '0 | ' + await pQueue.getAtIndex(0) + '\n' +
            '1 | ' + await pQueue.getAtIndex(1) + '\n' +
            '2 | ' + await pQueue.getAtIndex(2) + '\n' +
            '3 | ' + await pQueue.getAtIndex(3) + '\n' +
            '4 | ' + await pQueue.getAtIndex(4) + '\n' +
            '5 | ' + await pQueue.getAtIndex(5) + '\n' +
            '6 | ' + await pQueue.getAtIndex(6) + '\n' +
            '7 | ' + await pQueue.getAtIndex(7) + '\n' 
        )


        await pQueue.pop({from: controller})
        console.log('POP!')

        console.log(
            '0 | ' + await pQueue.getAtIndex(0) + '\n' +
            '1 | ' + await pQueue.getAtIndex(1) + '\n' +
            '2 | ' + await pQueue.getAtIndex(2) + '\n' +
            '3 | ' + await pQueue.getAtIndex(3) + '\n' +
            '4 | ' + await pQueue.getAtIndex(4) + '\n' +
            '5 | ' + await pQueue.getAtIndex(5) + '\n' +
            '6 | ' + await pQueue.getAtIndex(6) + '\n' +
            '7 | ' + await pQueue.getAtIndex(7) + '\n' 
        )

        // expect(
        //     (await pQueue.peek())[0].toNumber()
        // ).to.equal(67)
        // await pQueue.pop({from: controller})


        // expect(
        //     (await pQueue.peek())[0].toNumber()
        // ).to.equal(45)
        // await pQueue.pop({from: controller})


        // expect(
        //     (await pQueue.peek())[0].toNumber()
        // ).to.equal(33)
        // await pQueue.pop({from: controller})


        // expect(
        //     (await pQueue.peek())[0].toNumber()
        // ).to.equal(30)
        // await pQueue.pop({from: controller})


        // expect(
        //     (await pQueue.peek())[0].toNumber()
        // ).to.equal(25)
        // await pQueue.pop({from: controller})


        // expect(
        //     (await pQueue.peek())[0].toNumber()
        // ).to.equal(12)
        // await pQueue.pop({from: controller})

        // console.log(await pQueue.peek())
        // console.log(await pQueue.getAtIndex(1))
    })
})