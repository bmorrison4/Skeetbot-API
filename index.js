const express = require('express');
const bodyParser = require('body-parser');
const db = require('./queries');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header("X-Powered-By", "Tears of the damned");
    next();
});

app.get('/', (req, res) => {
    res.send('GET /api/users\nGET /api/users/:username\nGET /api/banned\nGET '
    + '/api/bannedusers\nGET /api/bannedips\nGET/api/stats\n\nPOST /api/users\n\n'
    + 'PUT /api/users/:username\n\nDEL /api/users/username')
});


app.get('/api/users', db.getUsers);
app.post('/api/users', db.createUser);
app.get('/api/users/:username', db.getUserById);
app.put('/api/users/:username', db.updateUser);
app.delete('/api/users/:username', db.deleteUser);
app.get('/api/banned', db.getAllBannedAccounts);
app.get('/api/bannedusers', db.getAllBannedUsers);
app.get('/api/bannedips', db.getAllBannedIps);
app.get('/api/stats', db.getStats);

app.listen(port, () => {
    console.log(`Rory running on port ${port}`);
})
