const IPFS = artifacts.require('IPFS.sol')
const b58 = require('base-58')

contract("IPFS", (accounts) => {
    const test_string = "datadadatadata"
    const expected_output = "QmeTzHg6GxN6kUPUD8UTK4vKdr1mcSC5M5KAnFqE1mzJbF"

    it("correctly parses a string to IPFS hash", async () => {
        const ipfs = await IPFS.new()
        const genHash = await ipfs.generateHash(test_string)
        // console.log(genHash)
        const encoded = b58.encode(Buffer.from("1220" + genHash.slice(2), 'hex'))
        // console.log(encoded)
        assert(
            encoded == expected_output,
            'output did not match expected'
        )
    })
})