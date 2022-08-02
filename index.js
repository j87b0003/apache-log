// Import
const express = require('express')
const cors = require('cors')
const app = express()

// Config
app.use(express.json())
app.use(cors({
    credentials: true,
    origin: true
}))
app.options('*', cors());

// Route
app.use('/', require('./router/apache-log'))

app.set('view engine', 'pug')
app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running.');
})
