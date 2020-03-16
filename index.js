// const pgAdapter = require('./postgresAdapter')
const app = require('express')()
const {authorizeUser} = require('./routes')
const bodyParser = require('body-parser')
const PORT = 5000

// pgAdapter.get_thumb("user", "hej1").then(console.log)


app.listen(PORT, () => console.log(`listening on ${PORT}`))
app.use(bodyParser.json())

app.get('/', (req, res) => res.send("I'm alive!"))

app.get('/authorize', authorizeUser)

app.get('/thumbs', (req, res) => {
    const { page_url } = req.query

    res.sendStatus(200)
})




function getThumbsForPage(page_url) {
    // return users and their sentiment for the specified page
}

function addThumbsUpForPage(page_url, userId) {
    // Add user with sentiment thumbs_up to page and return boolean
}
function addThumbsDownForPage(page_url, userId) {
    // Add user with sentiment thumbs_down to page and return boolean
}

function removeThumbsForPage(page_url, userId) {
    // Remove user from page
}