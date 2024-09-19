const md5 = require('md5');
const myDB = require('mysql2');


const con = myDB.createConnection({
    host: 'localhost',
    user: 'root',
    password: '#Siddhi2321',
    database: 'odyssey'
});

con.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
    } else {
        console.log('Connected to the database');
    }
});

function doLogin(req, res, view = 'none') {
    const { name, password } = req.body;
    con.query(
        `SELECT username, email, userID FROM users WHERE username = ? AND password = ?`,
        [name, md5(password)],
        (qErr, result) => {
            if (qErr) {
                res.send("<h2>db error</h2>");
            } else {
                if (result.length != 0) {
                    req.session.loggedIn = true;
                    req.session.user = result[0].username;
                    req.session.userID = result[0].userID;
                    res.redirect('/dashboard');
                } else {
                    res.send("Your username or password is wrong! please try again");
                }
            }
        }
    );
}

function registerUser(req, res) {
    const { username, email, password } = req.body;
    con.query(
        `INSERT INTO users (username,email, password) VALUES (?, ?, ?)`,
        [username, email, md5(password)],
        (qErr, result) => {
            if (qErr) {
                res.send("Database error during registration");
            } else {
                res.send("Registration successful. You can now log in.");
                
            }
        }
    );
}

function changePassword(req, res) {
    const { oldPassword, newPassword } = req.body;
    const userId = req.session.userID;
    con.query(
        `UPDATE users SET password = ? WHERE userID = ? AND password = ?`,
        [md5(newPassword), userId, md5(oldPassword)],
        (qErr, result) => {
            if (qErr) {
                res.send("Database error during password change");
            } else {
                if (result.affectedRows > 0) {
                    res.send("Password changed successfully");
                } else {
                    res.send("Old password is incorrect");
                }
            }
        }
    );
}

function forgotPassword(req, res) {
    const { email, newPassword } = req.body;
    con.query(
        `UPDATE users SET password = ? WHERE email = ?`,
        [md5(newPassword), email],
        (qErr, result) => {
            if (qErr) {
                res.send("Database error during password reset");
            } else {
                if (result.affectedRows > 0) {
                    res.send("Password reset successfully. You can now log in with the new password.");
                } else {
                    res.send("No user found with that email address");
                }
            }
        }
    );
}

function getData(req, tableName) {
    return new Promise((resolve, reject) => {
        const userId = req.session.userID;
        con.query(`SELECT * FROM ?? WHERE userID = ?`, [tableName, userId], (err, results) => {
            if (err) {
                reject(err); // If there's an error, reject the Promise
            } else {
                resolve(results); // If successful, resolve the Promise with the results
            }
        });
    });
}



// function addTransaction(req, res,categories) {
//     console.log("Transaction Data:", req.body);
//     const userId = req.session.userID;
//     const { amount, date, notes } = req.body;
    
//     // Example of how to handle table names dynamically, if you need to do so
//     const allowedTables = [{categories}, 'budget'];
//     if (!allowedTables.includes(categories)) {
//         return res.send("Invalid category");
//     }

//     const query = INSERT INTO ?? (userID, amount, date, notes,categoryID) VALUES (?, ?, ?, ?,1);
//     const values = [categories, userId, amount, date, notes];

//     con.query(query, values, (qErr, result) => {
//         if (qErr) {
//             console.error(qErr);
//             res.send("Database error during transaction adding");
//         } else {
//             res.send("Transaction successfully added");
//         }
//     });
// }

function addData(req, res) {
    const userId = req.session.userID;
    const { category, debitAmount ,date, notes } = req.body;
    

    let tableName = '';
    switch (category) {
        case 'expenses':
            tableName = 'expenses';
            break;
        case 'emi':
            addEmi(req,res);
            break;
        case 'investment':
            tableName = 'investments';
            break;
        case 'subscription':
            tableName = 'subscriptions';
            break;
        default:
            tableName = 'expenses';
    }
    const sql = `INSERT INTO ${tableName} (userID,categoryID,amount,date,notes) VALUES (?, 1, ?, ?,?)`;
    const values = [userId, debitAmount, date, notes];
    con.query(sql, [userId,debitAmount,date, notes], (err, result) => {
        if (err) throw err;
        res.send('Debit entry successfully added to ' + tableName);
    });
}

function addEmi(req, res) {
    const userId = req.session.userID;
    const { emiName, amount, dueDate, renewalPeriod, reminder, note } = req.body;
    const emiId=1;
 

    const sql = `INSERT INTO emis (userID, categoryID,emiName,amount,dueDate, renewalPeriod, reminderOn, notes) VALUES (?, 4, ?, ?, ?,?,?,?)`;
    con.query(sql, [userId,emiName, amount, dueDate, renewalPeriod, reminder, note], (err, result) => {
        if (err) throw err;
        res.send('EMI entry successfully added to emis table');
    });
}
function addInvest(req,res){
    const userId = req.session.userID;
    const { investmentName, amount, purchaseDate } = req.body;
    
    const investmentID=1;
    const currentValue=amount +(Math.random()*100);
    const sql = `INSERT INTO investments (investmentID,userID,categoryID,investmentName, amount, purchaseDate,currentValue) VALUES (?, ?, 3,?,?,?,?)`;
    con.query(sql, [investmentID+1,userId,investmentName, amount, purchaseDate,currentValue], (err, result) => {
        if (err){
            throw err;
        }else {
            res.send('Investment entry successfully added to investments table');
            
            
        }
        
    });

}

function addSub(req,res){
    const userId = req.session.userID;
    const { subscriptionName, amount, startDate, endDate, renewalPeriod, reminderOn, note } = req.body;
    const subId=0;
 
    const sql = `INSERT INTO subscriptions (subscriptionID,userID,categoryID,subscriptionName, amount, startDate, endDate, renewalPeriod, reminderOn, notes) 
                     VALUES (?, ?, 6, ?, ?, ?, ?,?,?,?)`;
    
    con.query(sql, [subId+1,userId,subscriptionName, amount, startDate, endDate, renewalPeriod, reminderOn, note], (err, result) => {
            if (err) {
                console.error("Error inserting subscription: ", err);
                res.status(500).send("An error occurred");
            } else {
                res.send('subscription added successfully '); // Redirect to the subscriptions page
            }
    });
    

}




module.exports = {
    doLogin,
    registerUser,
    changePassword,
    forgotPassword,
    getData,
    addData,
    addEmi,
    addInvest,
    addSub,

};



// function getExpenses(req, res) {
//     const userId = req.session.userID;
//     con.query(`SELECT * FROM expenses WHERE userID = '${req.session.userID}'`, 
//         (err, results) => {
//         if (err) {
//             res.send('Database error');
//         } else {
//             res.json(results);
//         }
//     });
// }

// function getSavingsGoals(req, res) {
//     const userId = req.session.userID;
//     con.query(`SELECT * FROM savingsgoals WHERE userID = '${req.session.userID}'`,  
//         (err, results) => {
//         if (err) {
//             res.send('Database error');
//         } else {
//             res.json(results);
//         }
//     });
// }

// function getBudgets(req, res) {
//     const userId = req.session.userID;
//     con.query('SELECT * FROM budgets WHERE userID = ?', [userId], (err, results) => {
//         if (err) {
//             res.status(500).send('Database error');
//         } else {
//             res.json(results);
//         }
//     });
// }

// function getFinancialReports(req, res) {
//     const userId = req.session.userID;
//     con.query('SELECT * FROM financialreports WHERE userID = ?', [userId], (err, results) => {
//         if (err) {
//             res.status(500).send('Database error');
//         } else {
//             res.json(results);
//         }
//     });
// }

// function getBillReminders(req, res) {
//     const userId = req.session.userID;
//     con.query('SELECT * FROM billreminders WHERE userID = ?', [userId], (err, results) => {
//         if (err) {
//             res.status(500).send('Database error');
//         } else {
//             res.json(results);
//         }
//     });
// }

// function getInvestments(req, res) {
//     const userId = req.session.userID;
//     con.query('SELECT * FROM investments WHERE userID = ?', [userId], (err, results) => {
//         if (err) {
//             res.status(500).send('Database error');
//         } else {
//             res.json(results);
//         }
//     });
// }

// function getForecasts(req, res) {
//     const userId = req.session.userID;
//     con.query('SELECT * FROM forecasts WHERE userID = ?', [userId], (err, results) => {
//         if (err) {
//             res.status(500).send('Database error');
//         } else {
//             res.json(results);
//         }
//     });
// }

// function getEMIs(req, res) {
//     const userId = req.session.userID;
//     con.query('SELECT * FROM emis WHERE userID = ?', [userId], (err, results) => {
//         if (err) {
//             res.status(500).send('Database error');
//         } else {
//             res.json(results);
//         }
//     });
// }

// function getSubscriptions(req, res) {
//     const userId = req.session.userID;
//     con.query('SELECT * FROM subscriptions WHERE userID = ?', [userId], (err, results) => {
//         if (err) {
//             res.status(500).send('Database error');
//         } else {
//             res.json(results);
//         }
//     });
// }

// module.exports = {
//     doLogin,
//     registerUser,
//     changePassword,
//     forgotPassword,
//     getExpenses,
//     getSavingsGoals,
//     getBudgets,
//     getFinancialReports,
//     getBillReminders,
//     getInvestments,
//     getForecasts,
//     getEMIs,
//     getSubscriptions
// };



