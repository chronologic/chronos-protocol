/**
 * This file stress tests the Priority Queue implementation to see what
 * the gas costs of submitting 10, 100, 1000, 10000 nodes into the Queue
 * come out to.
 */

const VERBOSE = true 

const log = (msg) => {
    if (VERBOSE) console.log(msg)
}

const printLine = () => {
    log('--**--'.repeat(12))
}

const printNewLine = () => {
    log('\n')
}

const main = async () => {
    const Web3 = require('web3')
    const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
    web3.eth.defaultAccount = (await web3.eth.getAccounts())[0]

    log(`Executing from: ${web3.eth.defaultAccount}`)
    printNewLine()


    const pQueueABI = require('../build/contracts/PriorityQueue.json').abi
    const pQueueBytecode = require('../build/contracts/PriorityQueue.json').bytecode
    const PriorityQueue = new web3.eth.Contract(pQueueABI)

    let pQueueDeployTxReceipt
    const pQueue = await PriorityQueue.deploy({
        data: pQueueBytecode,
    }).send({
        from: web3.eth.defaultAccount,
        gas: 3000000,
    }).on('receipt', (r) => {
        pQueueDeployTxReceipt = r
    })
    
    log(`Priority Queue address: ${pQueue.options.address}`)
    log(`Gas used while deploying Priority Queue: ${pQueueDeployTxReceipt.gasUsed}`)
    printLine()

    const startAddr = '0x2ffd48cc061331d071a1a8178cfc2a3863d56d4e'
    const nextAddr = (addr) => {
        let a = web3.utils.toBN(addr)
        a = a.add(web3.utils.toBN('1'))
        a = web3.utils.toHex(a)
        if (a.length > 64) {
            throw new Error('ERROR: ADDRESS OVERFLOW.. EXITING')
        }
        return a
    }

    const buildList = (num) => {
        let l = []

        let curAddr = startAddr
        let curVal
        for (let i = 0; i <= num; i++) {
            curVal = Math.floor(
                Math.random() * 10000
            )
            curAddr = nextAddr(curAddr)
            l.push({
                addr: curAddr, 
                val: curVal,
            })
        }
        return l
    }

    const list = buildList(10000)
    let most = 0

    printNewLine()
    printLine()
    log('TEST: 10 NODES')
    for (let i = 1; i < 10; i++) {
        const tx = await pQueue.methods.insert(list[i].val, list[i].addr).send({from: web3.eth.defaultAccount, gas: 3000000})
        if (parseInt(tx.gasUsed) > most) {
            most = parseInt(tx.gasUsed)
        }
    }
    let tx = await pQueue.methods.insert(list[10].val, list[10].addr).send({from: web3.eth.defaultAccount, gas: 3000000})
    log(`GAS USED FOR TENTH INSERT ${tx.gasUsed}`)
    log(`HIGHEST GAS USED DURING 10 INSERTS: ${most}`)
    printLine()

    printNewLine()
    printLine()
    log('TEST: 100 NODES')
    for (let i = 11; i < 100; i++) {
        const tx = await pQueue.methods.insert(list[i].val, list[i].addr).send({from: web3.eth.defaultAccount, gas: 3000000})
        if (parseInt(tx.gasUsed) > most) {
            most = parseInt(tx.gasUsed)
        }
    }
    tx = await pQueue.methods.insert(list[100].val, list[100].addr).send({from: web3.eth.defaultAccount, gas: 3000000})
    log(`GAS USED FOR HUNDREDTH INSERT ${tx.gasUsed}`)
    log(`HIGHEST GAS USED DURING 100 INSERTS: ${most}`)
    printLine()

    printNewLine()
    printLine()
    log('TEST: 1000 NODES')
    for (let i = 101; i < 1000; i++) {
        const tx = await pQueue.methods.insert(list[i].val, list[i].addr).send({from: web3.eth.defaultAccount, gas: 3000000})
        if (parseInt(tx.gasUsed) > most) {
            most = parseInt(tx.gasUsed)
        }
    }
    tx = await pQueue.methods.insert(list[1000].val, list[1000].addr).send({from: web3.eth.defaultAccount, gas: 3000000})
    log(`GAS USED FOR THOUSANDTH INSERT ${tx.gasUsed}`)
    log(`HIGHEST GAS USED DURING 1,000 INSERTS: ${most}`)
    printLine()

    printNewLine()
    printLine()
    log('TEST: 10000 NODES')
    for (let i = 1001; i < 10000; i++) {
        const tx = await pQueue.methods.insert(list[i].val, list[i].addr).send({from: web3.eth.defaultAccount, gas: 3000000})
        if (parseInt(tx.gasUsed) > most) {
            most = parseInt(tx.gasUsed)
        }
    }
    tx = await pQueue.methods.insert(list[10000].val, list[10000].addr).send({from: web3.eth.defaultAccount, gas: 3000000})
    log(`GAS USED FOR TEN-THOUSANDTH INSERT ${tx.gasUsed}`)
    log(`HIGHEST GAS USED DURING 10,000 INSERTS: ${most}`)
    printLine()



}

main()
.catch(e => console.log(e))
