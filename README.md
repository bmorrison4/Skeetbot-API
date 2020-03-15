# SkeetBot API
Database microservice for database access for SkeetBot.

All requests require a header key for authorization.

## User object
The data stored for a user is
1. username
2. CPU core count
3. GPU
4. user agent
5. username banned flag
6. IP banned flag
7. IP address
8. ISO timestamp of the last time the object was updated

No duplicate usernames are allowed; core counts received that are not numbers are stored as `0`.

# Routes
| Method | route | Description |
| ----- | ----- | ----- |
| **GET** | `/users` | Returns a list of all users |
| **POST** | `/users` | Creates a new user | 
| **GET** | `/users/:username` | Gets a user by username |
| **PUT** | `/users/:username` | Updates a user |
| **DELETE** | `/users/:username` | Deletes a user |
| **GET** | `/bannedusers` | Gets all users banned by username |
| **GET** | `/bannedips` | Gets all users banned by ip

# Required file not included
A file called `settings.json` is required to store sensitive data related to database access. It has the following structure.

```json
{
    "pg": {
        "user": "postgresusername",
        "host": "postgreshost",
        "database": "database",
        "password": "password",
        "port": 0000
    },
    "api": {
        "key": "secret"
    }
}
