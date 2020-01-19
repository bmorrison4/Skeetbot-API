const express = require('express');
const bodyParser = require('body-parser');
const db = require('./queries');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get('/', (req, res) => {
    res.json({ info: 'Node.js Express API for Rory' })
});


app.get('/users', db.getUsers);
app.post('/users', db.createUser);
app.put('/users/:username', db.updateUser);
app.delete('/users/:username', db.deleteUser);
app.get('/banned', db.getAllBannedAccounts);
app.get('/bannedusers', db.getAllBannedUsers);
app.get('/bannedips', db.getAllBannedIps);
app.get('/users/:username', db.getUserById);

app.listen(port, () => {
    console.log(`Rory running on port ${port}`);
})
