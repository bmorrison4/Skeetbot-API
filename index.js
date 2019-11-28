const express = require('express');
const bodyParser = require('body-parser');
const db = require('./queries');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.json({ info: 'Node.js Express API for Rory' })
});

app.get('/users', db.getUsers);
app.get('/users/:username', db.getUserById);
app.post('/users', db.createUser);
app.put('/users/:username', db.updateUser);
app.delete('/users/:username', db.deleteUser)

app.listen(port, () => {
    console.log(`Rory running on port ${port}`);
})