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
app.use(express.static(__dirname + '/public'))
app.use(express.static(__dirname + '/node_modules'))

// Session manager
app.use(session({
    secret: 'whatever',
    resave: false,
    saveUninitialized: false
}))

// Handlebars setup
app.engine('.hbs', hbs({ extname: '.hbs', defaultLayout: 'main',helpers:{
    date: (date) => {
        return date.toString().slice(0,-15)
    }
} }));
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

app.get('/report',(req,res) => {
    res.render('report')
})
app.get('/transactions', routes.transactions)
app.get('/get-chart-data',routes.getChartData)
app.get('/get-chart-data-income',routes.getChartDataIncome)
app.post('/expenditure', routes.expenditure)
app.post('/income', routes.income)
app.post('/update_balance', routes.update_balance)
app.post('/register', routes.register)
app.post('/login', routes.login)

app.listen(5000)