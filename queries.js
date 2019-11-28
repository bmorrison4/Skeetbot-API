const Pool = require('pg').Pool
const pool = new Pool({
    user: 'postgres',
    host: 'rory.local',
    database: 'connected_users',
    password: '',
    port: 5432,
})
const getUsers = (request, response) => {
    pool.query('SELECT * FROM users ORDER BY username ASC', (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getUserById = (request, response) => {
    const username = request.params.username

    pool.query('SELECT * FROM users WHERE username = $1', [username], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const createUser = (request, response, next) => {
    const { username, ip, useragent, cores, gpu, username_banned, ip_banned, last_seen } = request.body

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

const updateUser = (request, response) => {
    const username = request.params.username
    const { ip, useragent, cores, gpu, username_banned, ip_banned, last_seen } = request.body

    pool.query(
        'UPDATE users SET ip = $1, username_banned = $2, ip_banned = $3, useragent = $4, cores = $5, gpu = $6, last_seen = $7 WHERE username = $8',
        [ip, username_banned, ip_banned, useragent, cores, gpu, last_seen, username],
        (error, results) => {
            if (error) {
                throw error
            }
            response.status(200).send(`User modified with usernmame: ${username}`)
        }
    )
}

const deleteUser = (request, response) => {
    const username = request.params.username

    pool.query('DELETE FROM users WHERE username = $1', [username], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).send(`User deleted with ID: ${username}`)
    })
}

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
}