const express = require('express')
const cookieParser = require('cookie-parser')
const fs = require('fs')
const { send } = require('process')

const port = 3000
const app = express()



app.use(cookieParser())
app.use(express.static('public'))


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})


app.get('/data', async (req, res) => {

    let masterMapping = {}

    try {

        // get all genres
        const genreFolders = await fs.promises.readdir('public/genres')
        for (const genre of genreFolders) {
            const mapping = await fs.promises.readFile(`public/genres/${genre}/mapping.json`, 'utf-8')
            masterMapping[genre] = JSON.parse(mapping)
        }
        res.json(masterMapping)
    }
    catch (e) { console.log(e) }

})



app.listen(port, () => {
    console.log(`http://localhost:${port}`)
})
