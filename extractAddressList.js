const fs = require('fs')

fs.readdir('./build/contracts', (err, files) => {
    files.forEach(file => {
        fs.readFile(`./build/contracts/${file}`, (err, data) => {
            const tmp = JSON.parse(data)
            console.log(tmp)
        })
    })
})