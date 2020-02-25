const Pool = require('pg').Pool
const settings = require('./settings.json');

const pool = new Pool({
    user: settings.pg.user,
    host: settings.pg.host,
    database: settings.pg.database,
    password: settings.pg.password,
    port: settings.pg.port
})

/**
 * Makes sure the request has proper authorization.
 * 
 * @param {Express.Request} request Incoming request data
 * @example
 *      if (isAuthed(request)) {
 *          pool.query...
 *      }
 * @returns {Boolean} true if correct authorization is present in request header.
 */
function isAuthed(request) {
    return request.header('Authorization') === `Bearer ${settings.api.key}`;
}

/**
 * GET /api/users
 * 
 * Gets all users in the database, sorted in alphabetical order by username.
 * 
 * works
 * 
 * @async
 * @param {Express.Request} request Incoming query data
 * @param {Express.Response} response Outgoing query data
 */
module.exports.getAllUsers = async function (request, response) {
    console.log("GET /api/users");
    if (isAuthed(request)) {
        try {
            const results = await pool.query('SELECT * FROM users ORDER BY username ASC');
            response.status(200).json(results.rows);
        } catch (error) {
            console.error(error);
            response.status(500).send(`Internal Server Error: PSQL${error.code}`);
        }
    } else {
        response.status(401).send("Unauthorized");
    }
}

/**
 * GET /api/ips
 * 
 * Gets all ips in the database, sorted by IP.
 * 
 * works
 * 
 * @async
 * @param {Express.Request} request Incoming query data
 * @param {Express.Response} response Outgoing query data
 */
module.exports.getAllIps = async function (request, response) {
    console.log("GET /api/ips");
    if (isAuthed(request)) {
        try {
            const results = await pool.query('SELECT * FROM ips ORDER BY ip ASC');
            response.status(200).json(results.rows);
        } catch (error) {
            console.error(error);
            response.status(500).send(`Internal Server Error: PSQL${error.code}`);
        }
    } else {
        response.status(401).send("Unauthorized");
    }
}

/**
 * GET /api/users/:username
 * 
 * Gets a specific user from the database, if exists.
 * 
 * correct username: works
 * incorrect username: empty array (works?)
 * 
 * @async
 * @param {Express.Request} request Incoming query data
 * @param {Express.Response} response Outgoing query data
 */
module.exports.getUserByUsername = async function (request, response) {
    console.log(`GET /api/users/${request.params.username}`);
    if (isAuthed(request)) {
        try {
            const username = request.params.username;
            const results = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
            response.status(200).send(results.rows);
        } catch (error) {
            console.error(error);
            response.status(500).send(`Internal Server Error: PSQL${error.code}`)
        }
    } else {
        response.status(401).send("Unauthorized");
    }
}

/**
 * POST /api/users
 * 
 * Creates a new user in the database
 * 
 * Works
 * 
 * @async
 * @param {Express.Request} request Incoming query data
 * @param {Express.Response} response Outgoing query data
 */
module.exports.createUser = async function (request, response) {
    console.log("POST /api/users");
    if (isAuthed(request)) {
        const { username, ips, username_banned, useragent, cores, gpu, last_seen, ip_banned } = request.body;
        try {
            let status = 500;
            let results = await pool.query(
                'INSERT INTO users (username, ips, username_banned, useragent, cores, gpu, last_seen) VALUES ($1, $2, $3, $4, $5, $6, $7) ON CONFLICT DO NOTHING',
                [username, ips, username_banned, useragent, cores, gpu, last_seen]);
            response.status(201).send(`User created with username ${username}`);
        } catch (e) {
            console.error(e);
            response.status(500).send();
        }
    } else {
        response.status(401).send("Unauthorized");
    }
}

module.exports.createIp = async function (request, response) {
    console.log("POST /api/ips");
    if (isAuthed(request)) {
        const {ip, banned } = request.body;
        try {
            let results = await pool.query(
                'INSERT INTO ips (ip, banned) VALUES ($1, $2) ON CONFLICT DO NOTHING', [ip, banned]
            );
            response.status(201).send(`IP created with ip ${ip}`);
        } catch (e) {
            console.error(e);
            response.status(500).send(`Internal Server Error: PSQL${error.code}`);
        }
    } else {
        response.status(401).send("Unauthorized.");
    }
}

/**
 * PUT /api/users/:username
 * 
 * Update a user in the database, if exists
 * 
 * works
 * 
 * @async
 * @param {Express.Request} request Incoming query data
 * @param {Express.Response} response Outgoing query data
 */
module.exports.updateUser = async function (request, response) {
    console.log(`PUT /api/users/${request.params.username}`);

    if (isAuthed(request)) {
        try {
            const username = request.params.username;
            const { ips, useragent, cores, gpu, username_banned, last_seen } = request.body;
            let results = await pool.query(
                'UPDATE users SET cores = $1, gpu = $2, ips = $3, last_seen = $4, useragent = $5, username_banned = $7 WHERE username = $6',
                [cores, gpu, ips, last_seen, useragent, username, username_banned]);
            response.status(200).send(`User modified with username ${username}`);
        } catch (error) {
            console.error(error);
            response.status(500).send(`Internal Server Error: PSQL${error.code}`)
        }
    } else {
        response.status(401).send("Unauthorized.");
    }
}

module.exports.updateIp = async function (request, response) {
    console.log(`PUT /api/ips/}`);

    if (isAuthed(request)) {
        try {
            const { ip, banned } = request.body;
            const results = await pool.query(
                'UPDATE ips SET banned = $2 WHERE ip = $1',
                [ip, banned]);
            response.status(200).send(`IP updated: ${ip}`);
        } catch (error) {
            console.error(error);
            response.status(500).send(`Internal Server Error: PSQL${error.code}`);
        }
    } else {
        response.status(401).send("Unauthorized");
    }
}

module.exports.getIp = async function (request, response) {
    console.log("GET /api/ip");

    if (isAuthed(request)) {
        try {
            const { ip } = request.body;
            const results = await pool.query(
                'SELECT * FROM ips WHERE ip = $1', [ip]);
            response.status(200).send(results.rows);
        } catch (error) {
            console.error(error);
            response.status(500).send(`Internal Server Error: PSQL${error.code}`);
        }
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
 * @param {Express.Request} request Incoming query data
 * @param {Express.Response} response Outgoing query data
 */
module.exports.deleteUser = async function (request, response) {
    console.log(`DEL /api/users/${request.params.username}`)
    if (isAuthed(request)) {
        try {
            const username = request.params.username;
            const results = await pool.query('DELETE FROM users WHERE username = $1', [username]);
            response.status(200).send(`User deleted with username: ${username}`);

        } catch (error) {
            console.error(error);
            response.status(500).send(`Internal Server Error: PSQL${error.code}`);
        }
    } else {
        response.status(401).send("Unauthorized.");
    }
}

/**
 * GET /api/bannedusers
 * 
 * Gets all users with a true username ban flag.
 * 
 * works
 * 
 * @async
 * @param {Express.Request} request Incoming query data
 * @param {Express.Response} response Outgoing query data
 */
module.exports.getAllBannedUsers = async function (request, response) {
    console.log("GET /api/bannedusers");

    if (isAuthed(request)) {
        try {
            const results = await pool.query(
                'SELECT * FROM users WHERE username_banned = true ORDER BY username ASC');
            response.status(200).json(results.rows);
        } catch (error) {
            console.error(error);
            response.status(500).send(`Internal Server Error: PSQL${error.code}`);
        }
    } else {
        response.status(401).send("Unauthorized");
    }
}

/**
 * GET /api/bannedips
 * 
 * Gets all ips witha true ban flag.
 * 
 * works
 * 
 * @async
 * @param {Express.Request} request Incoming query data
 * @param {Express.Response} response Outgoing query data
 */
module.exports.getAllBannedIps = async function (request, response) {
    console.log("GET /api/bannedips");

    if (isAuthed(request)) {
        try {
            const results = await pool.query(
                'SELECT * FROM ips WHERE banned = true');
            response.status(200).json(results.rows);
        } catch (error) {
            console.error(error);
            response.status(500).send(`Internal Server Error: PSQL${error.code}`);
        }
    } else {
        response.status(401).send("Unauthorized");
    }
}

/**
 * GET /api/stats
 * 
 * Gets statistics about the database
 * 
 * {
 *  "count": number
 *  "bans": number
 *  "username_bans": number
 *  "ip_bans": number
 *  "newest_seen": Date.ISOString
 * }
 * 
 * @param {Express.Request} request Incoming query data
 * @param {Express.Response} response Outgoing query data
 */
module.exports.getStats = function (request, response) {
    console.log("GET /api/stats");

    response.status(501).send("Not implemented");

}
