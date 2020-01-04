const Pool = require('pg').Pool
const settings = require('./settings.json');

const pool = new Pool({
    user: settings.pg.user,
    host: settings.pg.host,
    database: settings.pg.database,
    password: settings.pg.password,
    port: settings.pg.port,
})
const getUsers = (request, response) => {
    console.log("GET /users");
    if (request.header('key') === settings.api.key) {

        pool.query('SELECT * FROM users ORDER BY username ASC', (error, results) => {
            if (error) {
                console.log(error.code);
                response.status(500).send(`Internal Server Error: ${error.code}`)

            } else {
                response.status(200).json(results.rows)
            }
        })
    } else {
        response.status(401).send("Unauthorized");
    }
}

const getUserById = (request, response) => {
    const username = request.params.username

    console.log(`GET /users/${username}`);

    if (request.header('key') === settings.api.key) {

        pool.query('SELECT * FROM users WHERE username = $1', [username], (error, results) => {
            if (error) {
                console.log(error.code);
                response.status(500).send(`Internal Server Error: ${error.code}`)
            } else {
                response.status(200).send(results.rows)
            }
        })
    } else {
        response.status(401).send("Unauthorized");
    }

}

const createUser = (request, response) => {
    const { username, ip, useragent, cores, gpu, username_banned, ip_banned, last_seen } = request.body

    console.log("POST /users")

    if (request.header('key') === settings.api.key) {
        pool.query(
            'INSERT INTO users (username, ip, username_banned, ip_banned, useragent, cores, gpu, last_seen) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [username, ip, username_banned, ip_banned, useragent, cores, gpu, last_seen], (error, results) => {
                if (error) {
                    console.log(error.code);
                    response.status(500).send(`Internal Server Error: ${error.code}`);
                } else {
                    response.status(201).send(`User added with ID: ${username}`)
                }
            })
    } else {
        response.status(401).send("Unauthorized");
    }
}

const updateUser = (request, response) => {
    const username = request.params.username
    const { ip, useragent, cores, gpu, username_banned, ip_banned, last_seen } = request.body

    console.log(`PUT /users/${username}`)

    if (request.header('key') === settings.api.key) {
        pool.query(
            'UPDATE users SET ip = $1, username_banned = $2, ip_banned = $3, useragent = $4, cores = $5, gpu = $6, last_seen = $7 WHERE username = $8',
            [ip, username_banned, ip_banned, useragent, cores, gpu, last_seen, username],
            (error, results) => {
                if (error) {
                    console.log(error.code);
                    response.status(500).send(`Internal Server Error: ${error.code}`)
                } else {
                    response.status(200).send(`User modified with usernmame: ${username}`)
                }
            })
    } else {
        response.status(401).send("Unauthorized");
    }
}

const deleteUser = (request, response) => {
    const username = request.params.username

    console.log(`DEL /users/${username}`)

    if (request.header('key') === settings.api.key) {
        pool.query('DELETE FROM users WHERE username = $1', [username], (error, results) => {
            if (error) {
                console.log(error.code);
                response.status(500).send(`Internal Server Error: ${error.code}`)
            } else {
                response.status(200).send(`User deleted with ID: ${username}`)
            }
        })
    } else {
        response.status(401).send("Unauthorized");
    }

}

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
}
