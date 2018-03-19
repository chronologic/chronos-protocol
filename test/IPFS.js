const IPFS_Contract = artifacts.require('IPFS.sol')

const test_string = "datadadatadata"
const expected_output = "QmeTzHg6GxN6kUPUD8UTK4vKdr1mcSC5M5KAnFqE1mzJbF"

const assert = (condition, errorMsg) => {
    if (!condition) {
        throw new Error(errorMsg)
    }
}

contract("IPFS", async (accounts) => {
    let ipfs = await IPFS_Contract.new()

    it("correctly parses a string to IPFS hash", async () => {
        const genHash = await ipfs.generateHash(test_string)
        assert(
            genHash == expected_output,
            'output did not match expected'
        )
    })

    it('throws', () => {
        throw new Error('help')
    })
})