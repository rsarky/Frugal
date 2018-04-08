// import { error } from 'util';

const mysql = require('mysql')

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'iluvcricket',
    database: 'frugal'

})

connection.connect((err) => {
    if (!err) {
        console.log('Database is connected ... \n\n')
    }
    else {
        console.log('Error connecting database... \n\n')
    }
})

exports.register = (req, res) => {
    const today = new Date()
    const users = {
        "first_name": req.body.first_name,
        "last_name": req.body.last_name,
        "email": req.body.email,
        "password": req.body.password,
        "created": today,
        "modified": today
    }

    let id
    connection.query('INSERT INTO users SET ?', users, (error, results, fields) => {
        if (error) {
            console.log('error occured', error)
            res.send({
                'code': 400,
                'failed': 'error occured'
            })
        }
        else {
            // res.send({
            //     'code': 200,
            //     'success': 'user registered successfully'
            // })
            id = results.insertId
            // On registration initialize balance to 0.    
            const user_balance = {
                "user_id": id,
                "cash": 0,
                "ewallet": 0,
                "bank": 0
            }
            connection.query('INSERT INTO balance SET ?', user_balance, (error, results, fields) => {
                if (error) {
                    console.log('error occured', error)
                }
                else {
                    console.log('No error')
                }
            })
            res.redirect('/')
        }
    })

}

exports.login = (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    connection.query('SELECT * FROM users WHERE email = ?', [email], (error, results, fields) => {
        if (error) {
            res.send({
                "code": 400,
                "failed": "error ocurred"
            })
        } else {
            if (results.length > 0) {
                if (results[0].password == password) {
                    req.session.userid = results[0].id
                    res.redirect('/dashboard')
                }
                else {
                    res.render('index', { nomatch: true })
                }
            }
            else {
                res.send({
                    "code": 204,
                    "success": "Email does not exits"
                });
            }
        }
    });
}

exports.update_balance = (req, res) => {
    const id = req.session.userid
    let cash = parseInt(req.body.cash)
    let bank = parseInt(req.body.bank)
    let ewallet = parseInt(req.body.ewallet)
    connection.query('UPDATE balance set cash=? where user_id=?', [cash, id], (err, result, fields) => {
        if (err) { }
        else {
            connection.query('UPDATE balance set bank=? where user_id=?', [bank, id], (err, result, fields) => {
                if (err) { }
                else {
                    connection.query('UPDATE balance set ewallet=? where user_id=?', [ewallet, id], (err, result, fields) => {
                        if (err) { }
                        else {
                            res.redirect('/dashboard')
                        }
                    })
                }
            })
        }
    })
}

exports.expenditure = (req, res) => {
    const transaction = {
        user_id: req.session.userid,
        date_time: req.body.date + " " + req.body.time + ":00",
        category: req.body.category,
        amount: req.body.amount,
        mode: req.body.mode,
        comments: req.body.comments
    }
    console.log(transaction)
    connection.query('INSERT INTO expense SET ?', transaction, (error, results, fields) => {
        if (error) {
            console.log('error occured', error)
            res.send({
                'code': 400,
                'failed': 'error occured'
            })
        }
        else {
            // res.send({
            //     'code': 200,
            //     'success': 'expense recorded registered successfully'
            // })
            if (req.body.mode === 'cash') {
                connection.query('SELECT cash from balance where user_id=?', [req.session.userid],
                    (err, results, fields) => {
                        if (err) {
                            console.log(err)
                            res.end()
                        }
                        else {
                            let cash = results[0].cash - parseInt(transaction.amount)
                            connection.query('UPDATE balance set cash=? where user_id=?', [cash, req.session.userid],
                                (err, results, fields) => {
                                    if (err) {
                                        console.log(err)
                                        res.end()
                                    }
                                    else {
                                        res.redirect('/dashboard')
                                    }
                                })

                        }
                    })
            } else if (req.body.mode === 'ewallet') {
                connection.query('SELECT ewallet from balance where user_id=?', [req.session.userid],
                    (err, results, fields) => {
                        if (err) {
                            console.log(err)
                            res.end()
                        }
                        else {
                            let cash = results[0].ewallet - parseInt(transaction.amount)
                            connection.query('UPDATE balance set ewallet=? where user_id=?', [cash, req.session.userid],
                                (err, results, fields) => {
                                    if (err) {
                                        console.log(err)
                                        res.end()
                                    }
                                    else {
                                        res.redirect('/dashboard')
                                    }
                                })

                        }
                    })
            } else {
                connection.query('SELECT bank from balance where user_id=?', [req.session.userid],
                    (err, results, fields) => {
                        if (err) {
                            console.log(err)
                            res.end()
                        }
                        else {
                            let cash = results[0].bank - parseInt(transaction.amount)
                            connection.query('UPDATE balance set ewallet=? where user_id=?', [cash, req.session.userid],
                                (err, results, fields) => {
                                    if (err) {
                                        console.log(err)
                                        res.end()
                                    }
                                    else {
                                        res.redirect('/dashboard')
                                    }
                                })

                        }
                    })
            }

        }
    })

}

exports.income = (req, res) => {
    const transaction = {
        user_id: req.session.userid,
        date_time: req.body.date + " " + req.body.time + ":00",
        source: req.body.category,
        amount: req.body.amount,
        mode: req.body.mode,
        comments: req.body.comments
    }
    console.log(transaction)
    connection.query('INSERT INTO income SET ?', transaction, (error, results, fields) => {
        if (error) {
            console.log('error occured', error)
            res.send({
                'code': 400,
                'failed': 'error occured'
            })
        }
        else {
            if (req.body.mode === 'cash') {
                connection.query('SELECT cash from balance where user_id=?', [req.session.userid],
                    (err, results, fields) => {
                        if (err) {
                            console.log(err)
                            res.end()
                        }
                        else {
                            let cash = results[0].cash + parseInt(transaction.amount)
                            connection.query('UPDATE balance set cash=? where user_id=?', [cash, req.session.userid],
                                (err, results, fields) => {
                                    if (err) {
                                        console.log(err)
                                        res.end()
                                    }
                                    else {
                                        res.redirect('/dashboard')
                                    }
                                })

                        }
                    })
            } else if (req.body.mode === 'ewallet') {
                connection.query('SELECT ewallet from balance where user_id=?', [req.session.userid],
                    (err, results, fields) => {
                        if (err) {
                            console.log(err)
                            res.end()
                        }
                        else {
                            let cash = results[0].ewallet + parseInt(transaction.amount)
                            connection.query('UPDATE balance set ewallet=? where user_id=?', [cash, req.session.userid],
                                (err, results, fields) => {
                                    if (err) {
                                        console.log(err)
                                        res.end()
                                    }
                                    else {
                                        res.redirect('/dashboard')
                                    }
                                })

                        }
                    })
            } else {
                connection.query('SELECT bank from balance where user_id=?', [req.session.userid],
                    (err, results, fields) => {
                        if (err) {
                            console.log(err)
                            res.end()
                        }
                        else {
                            let cash = results[0].bank + parseInt(transaction.amount)
                            connection.query('UPDATE balance set ewallet=? where user_id=?', [cash, req.session.userid],
                                (err, results, fields) => {
                                    if (err) {
                                        console.log(err)
                                        res.end()
                                    }
                                    else {
                                        res.redirect('/dashboard')
                                    }
                                })

                        }
                    })
            }

        }
    })

}
exports.getUserById = (id) => {
    // Promises are motherfucking assholes.
    return new Promise((resolve, reject) => {
        connection.query('SELECT * from users where ID = ?', [id], (err, results, fields) => {
            if (err) { reject(err) }
            else {
                resolve(results[0])
            }
        })
    })
}

exports.getBalanceById = (id) => {
    return new Promise((resolve, reject) => {
        connection.query('SELECT cash,ewallet,bank from balance where USER_ID=?', [id],
            (err, results, fields) => {
                if (err) {
                    console.log("There was an error")
                    reject(err)
                }
                else {
                    console.log("No error")
                    resolve(results[0])
                }
            })
    })
}