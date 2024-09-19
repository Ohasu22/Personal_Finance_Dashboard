const express = require('express');
var router = express.Router();
var session = require('express-session');
var dbUse = require('../dbCon/connection.js');
const bodyParser = require('body-parser');

/* check Login status middleware */
chkLogin = (req, res, next) => {
    if (req.session.hasOwnProperty('loggedIn') && req.session.loggedIn == true) {
        next();
    } else res.redirect("/login");
}

// Main dashboard route
router.get('/', chkLogin, (req, res) => {
    res.render('dashboard', { session: req.session });
});

// Route for getting expenses
router.get('/expenses', chkLogin, (req, res) => {
    dbUse.getData(req, 'expenses')
        .then(data => {
            
            res.render('expenses', { expenses: data });
        })
        .catch(err => {
            console.error('Error fetching expenses:', err);
            res.status(500).send('An error occurred while fetching expenses data.');
        });
});



// Route for getting savings goals
router.get('/savingsgoals', chkLogin, (req, res) => {
    dbUse.getData(req, 'savingsgoals')
        .then(data => {
            
            res.render('savingsgoals', { savingsgoals: data });
        })
        .catch(err => {
            console.error('Error fetching savings goals:', err);
            res.status(500).send('An error occurred while fetching savings goals data.');
        });
});



// Route for getting financial reports
router.get('/financialreports', chkLogin, (req, res) => {
    dbUse.getData(req, 'financialreports')
        .then(data => {
            
            res.render('financialreports', { financialreports: data });
        })
        .catch(err => {
            console.error('Error fetching financial reports:', err);
            res.status(500).send('An error occurred while fetching financial reports data.');
        });
});



// Route for getting bill reminders
router.get('/billreminders', chkLogin, (req, res) => {
    dbUse.getData(req, 'billreminders')
        .then(data => {
            
            res.render('billreminders', { billreminders: data });
        })
        .catch(err => {
            console.error('Error fetching bill reminders:', err);
            res.status(500).send('An error occurred while fetching bill reminders data.');
        });
});



// Route for getting investments
router.get('/investments', chkLogin, (req, res) => {
    dbUse.getData(req, 'investments')
        .then(data => {
            
            res.render('investments', { investments: data });
        })
        .catch(err => {
            console.error('Error fetching investments:', err);
            res.status(500).send('An error occurred while fetching investments data.');
        });
});



// Route for getting EMIs
router.get('/emis', chkLogin, (req, res) => {
    dbUse.getData(req, 'emis')
        .then(data => {
            console.log(data);
            // Render the emis.ejs template and pass the data to it
            res.render('emis', { emis: data });
        })
        .catch(err => {
            console.error('Error fetching EMIs:', err);
            res.status(500).send('An error occurred while fetching EMIs data.');
        });
});



// Route for getting subscriptions
router.get('/subscriptions', chkLogin, (req, res) => {
    dbUse.getData(req, 'subscriptions')
        .then(data => {
            // Render the subscriptions.ejs template and pass the data to it
            
            res.render('subscriptions', { subscriptions: data });
        })
        .catch(err => {
            console.error('Error fetching subscriptions:', err);
            res.status(500).send('An error occurred while fetching subscriptions data.');
        });
});


    
router.get('/form' , chkLogin , (req,res) =>{
    res.render('form.ejs');
});

router.get('/debitForm' , chkLogin , (req,res) =>{
    res.render('debitForm.ejs');
});
router.get('/emi-form' , chkLogin , (req,res) =>{
    res.render('emiForm.ejs');
});
router.get('/investment-form' , chkLogin , (req,res) =>{
    res.render('investmentForm.ejs');
});
router.get('/subscription-form' , chkLogin , (req,res) =>{
    res.render('subscriptionForm.ejs');
});


// Endpoint to get the total amount for a specific userID
router.get('/getTotalAmount/:userID', (req, res) => {
    const userID = req.params.userID;

    const sql = `SELECT SUM(totalAmount) AS totalAmount FROM budgets WHERE userID = ?`;

    db.query(sql, [userID], (err, result) => {
        if (err) {
            console.error("Error fetching total amount: ", err);
            res.status(500).send("An error occurred");
        } else {
            // Send the total amount as a response
            res.json(result[0].totalAmount);
        }
    });
});


// router.post('/submit-credit', (req, res) => {
//     const { creditAmount, note } = req.body;
//     res.send(`Credit Amount: ${creditAmount}, Note: ${note}`);
// });


module.exports = router;
