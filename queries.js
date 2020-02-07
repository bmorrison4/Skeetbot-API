const Pool = require('pg').Pool
const settings = require('./settings.json');

const pool = new Pool({
    user: settings.pg.user,
    host: settings.pg.host,
    database: settings.pg.database,
    password: settings.pg.password,
    port: settings.pg.port,
})

/**
 * GET /api/users
 * 
 * Gets all users in the database, sorted in alphabetical order by username.
 * 
 * @async
 * @param {Express.Request} request incoming query data
 * @param {Express.Response} response outgoing query data
 */
const getUsers = (request, response) => {
    console.log("GET /api/users");
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

/**
 * GET /api/users/:username
 * 
 * Gets a specific user from the database, if exists.
 * 
 * @async
 * @param {Express.Request} request incoming query data
 * @param {Express.Response} response outgoing query data
 */
const getUserById = (request, response) => {
    const username = request.params.username

    console.log(`GET /api/users/${username}`);

    if (request.header('key') === settings.api.key) {
        pool.query('SELECT * FROM users WHERE username = $1 ORDER BY username ASC', [username], (error, results) => {
            if (error) {
                console.error(error.code);
                response.status(500).send(`Internal Server Error: ${error.code}`);
            } else {
                response.status(200).send(results.rows);
            }
        })
    } else {
        response.status(401).send("Unauthorized");
    }

}

/**
 * POST /api/users
 * 
 * Creates a new user in the database
 * 
 * @async
 * @param {Express.Request} request incoming query data
 * @param {Express.Response} response outgoing query data
 */
const createUser = (request, response) => {
    const { username, ip, useragent, cores, gpu, username_banned, ip_banned, last_seen } = request.body

    console.log("POST /api/users")

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


/**
 * PUT /api/users/:username
 * 
 * Update a user in the database, if exists.
 * 
 * @async
 * @param {Express.Request} request incoming query response
 * @param {Express.Response} response outgoing query response
 */
const updateUser = (request, response) => {
    const username = request.params.username
    const { ip, useragent, cores, gpu, username_banned, ip_banned, last_seen } = request.body

    console.log(`PUT /api/users/${username}`)

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

/**
 * DEL /api/users/:username
 * 
 * Deletes a user from the database, if exists.
 * 
 * @async
 * @param {Express.Request} request incoming query data
 * @param {Express.Response} response outgoing query data
 */
const deleteUser = (request, response) => {
    const username = request.params.username

    console.log(`DEL /api/users/${username}`)

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


/**
 * GET /api/banned
 * 
 * Gets all accounts with a true username or IP ban flag.
 * 
 * @async
 * @param {Express.Request} request incoming query data
 * @param {Express.Response} response outgoing query data
 */
const getAllBannedAccounts = async (request, response) => {
    console.log('GET /api/banned');
    if (request.header('key') === settings.api.key) {
        try {
            const results = await pool.query('SELECT * FROM users WHERE username_banned = true OR ip_banned = true');
            response.status(200).send(results.rows);
        } catch (e) {
            console.log(e.code);
            response.status(500).send(`Internal Server Error: ${e.code}`);
        }
    } else {
        response.status(401).send("Unauthorized");
    }
}

/**
 * GET /api/bannedusers
 * 
 * Gets all users with a true username ban flag.
 * 
 * @async
 * @param {Express.Request} request incoming query data
 * @param {Express.Response} response outgoing query data
 */
const getAllBannedUsers = async (request, response) => {

    console.log(`GET /api/bannedusers`, request.header('key'));

    if (request.header('key') === settings.api.key) {
        try {
            const results = await pool.query('SELECT * FROM users WHERE username_banned = true');
            response.status(200).send(results.rows)
        } catch (e) {
            console.log(e.code);
            response.status(500).send(`Internal Server Error: ${e.code}`)
        }

    } else {
        response.status(401).send("Unauthorized");
    }
}

/**
 * GET /api/bannedips
 * 
 * Gets all users with a true IP ban flag.
 * 
 * @async
 * @param {Express.Request} request incoming query data
 * @param {Express.Response} response outgoing query data
 */
const getAllBannedIps = async (request, response) => {

    console.log(`GET /api/bannedips`);

    if (request.header('key') === settings.api.key) {
        try {
            const results = await pool.query('SELECT * FROM users WHERE ip_banned = true');
            response.status(200).send(results.rows)
        } catch (e) {
            console.log(e.code);
            response.status(500).send(`Internal Server Error: ${e.code}`)
        }

    } else {
        response.status(401).send("Unauthorized");
    }
}

/**
 * GET /api/stats
 * 
 * Gets statistics for the database.
 * 
 * { 
 *  "count": number,
 *  "bans": number,
 *  "username_bans": number,
 *  "ip_bans": number,
 *  "oldest_seen": Date.ISOString,
 *  "newest_seen": Date.ISOString
 * }
 * 
 * @async
 * @param {Express.Request} request incoming query data
 * @param {Express.Response} response outgoing query data
 */
const getStats = async (request, response) => {
    console.log('GET /api/stats');
    let results = {
        count: 0,
        bans: 0,
        username_bans: 0,
        ip_bans: 0,
        oldest_seen: Date.now(),
        newest_seen: Date.parse('01 Jan 1970 00:00:00 GMT')
    }

    try {
        const users = await pool.query('SELECT * FROM users');
        results.count = users.rows.length;
        for (user of users.rows) {
            if (user.username_banned || user.ip_banned) {
                results.bans += 1;
                if (user.username_banned) {
                    results.username_bans += 1;
                } else {
                    results.ip_bans += 1;
                }
            }

            if (user.last_seen < results.oldest_seen) {
                results.oldest_seen = user.last_seen;
            }

            if (user.last_seen > results.newest_seen) {
                results.newest_seen = user.last_seen;
            }
        }

        response.status(200).send(JSON.stringify(results));

    } catch (e) {
        console.log(e.code);
        response.status(500).send(`Internal Server Error: ${e.code}`);
    }
}


module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    deleteUser,
    getAllBannedUsers,
    getAllBannedIps,
    getAllBannedAccounts,
    getStats
}


