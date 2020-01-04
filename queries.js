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
    if (request.header('key') === settings.api.key) {

        pool.query('SELECT * FROM users ORDER BY username ASC', (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        })
    }
    response.status(401).end();
}

const getUserById = (request, response) => {
    const username = request.params.username

    if (request.header('key') === settings.api.key) {

        pool.query('SELECT * FROM users WHERE username = $1', [username], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).json(results.rows)
        })
    }
    response.status(401).end();

}

const createUser = (request, response, next) => {
    const { username, ip, useragent, cores, gpu, username_banned, ip_banned, last_seen } = request.body

    if (request.header('key') === settings.api.key) {
        pool.query(
            'INSERT INTO users (username, ip, username_banned, ip_banned, useragent, cores, gpu, last_seen) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
            [username, ip, username_banned, ip_banned, useragent, cores, gpu, last_seen], (error, results) => {
                if (error) {
                    console.log(error.code);
                    // next(error);
                    if (error.code === '23505') {
                        response.status(409).send(error.detail);
                    }

                } else {
                    response.status(201).send(`User added with ID: ${results.insertUsername}`)
                }
            })
    }
    response.status(401).end();
}

const updateUser = (request, response) => {
    const username = request.params.username
    const { ip, useragent, cores, gpu, username_banned, ip_banned, last_seen } = request.body

    if (request.header('key') === settings.api.key) {
        pool.query(
            'UPDATE users SET ip = $1, username_banned = $2, ip_banned = $3, useragent = $4, cores = $5, gpu = $6, last_seen = $7 WHERE username = $8',
            [ip, username_banned, ip_banned, useragent, cores, gpu, last_seen, username],
            (error, results) => {
                if (error) {
                    throw error
                }
                response.status(200).send(`User modified with usernmame: ${username}`)
            })
    }
    response.status(401).end();
}

const deleteUser = (request, response) => {
    const username = request.params.username

    if (request.header('key') === settings.api.key) {
        pool.query('DELETE FROM users WHERE username = $1', [username], (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`User deleted with ID: ${username}`)
        })
    }
    response.status(401).end();
}

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
}