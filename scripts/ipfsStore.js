const IPFS = require('ipfs')
const node = new IPFS()

node.once('ready', () => {
    console.log('IPFS is now ON')
    node.id((err, res) => {
        if (!err) {
            console.log(`Node ID: ${res.id}`)
        }
    })

    node.files.add([Buffer.from('randomString')], (err, filesAdded) => {
        if (err) throw err
        const hash = filesAdded[0].hash
        console.log(`Hash: ${hash}`)

        node.files.cat(hash, (err, data) => {
            if (err) throw err
            console.log(`Data: ${data}`)
        })
    })
})