const express = require('express')
const routes = require('./routes/routes')
const bodyParser = require('body-parser')
const logger = require('morgan')
const session = require('express-session')
const hbs = require('express-handlebars')

const app = express()

// Body Parser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

// HTML request logger
app.use(logger('combined'))
app.use(express.static('public'))

// Session manager
app.use(session({
    secret: 'whatever',
    resave: false,
    saveUninitialized: false
}))

// Handlebars setup
app.engine('.hbs', hbs({ extname: '.hbs', defaultLayout: 'main' }));
app.set('view engine', '.hbs');


app.get('/', (req, res, next) => {
    res.render('index', { layout: false })
})

app.get('/dashboard', async (req, res) => {
    // Promise madarchod hai
    let user = await routes.getUserById(req.session.userid)
    let balance
    try {
        balance = await routes.getBalanceById(req.session.userid)
    }
    catch (err) {
        // Handle error
        console.log("ERROR : " +  err)
    }
    res.render('dashboard', { username: user.first_name, cash: balance.cash, ewallet: balance.ewallet, bank: balance.bank })
})


// app.post('/dashboard/expenditure', routes.expenditure)

// const router = express.Router()
app.post('/update_balance', routes.update_balance)
app.post('/register', routes.register)
app.post('/login', routes.login)
app.listen(5000)