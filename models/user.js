const db = require('../db');
const ExpressError = require('../helpers/expressError');
const partialUpdate = require('../helpers/partialUpdate');
const bcrypt = require('bcrypt')

const {
  BCRYPT_WORK_FACTOR
} = require('../config')


class User {
  static async login({username, password}) {
    let result = await db.query(`
    SELECT password, is_admin
    FROM users
    WHERE username = $1 `, [username]);

    if (result.rows.length === 0) {
      throw new ExpressError('User not found', 404)
    }

    return result.rows;
  }

  static async add({
    username,
    password,
    first_name,
    last_name,
    email,
    photo_url,
    is_admin
  }) {
    if (is_admin) {
      is_admin = true;
    } else {
      is_admin = false;
    }
    let hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR)
    let result = await db.query(`
    INSERT INTO users
    (username, password, first_name, last_name, email, photo_url, is_admin)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING username, first_name, last_name, email, photo_url, is_admin
    `, [username, hashedPassword, first_name, last_name, email, photo_url, is_admin])
    return result.rows;
  }

  static async getAll() {
    let result = await db.query(`
    SELECT username, first_name, last_name, email, photo_url, is_admin FROM users
    `)
    return result.rows;
  }

  static async get(username) {
    let result = await db.query(`
    SELECT username, first_name, last_name, email, photo_url, is_admin 
    FROM users
    WHERE username = $1
    `, [username]);
    if (result.rows.length === 0) {
      throw new ExpressError("User not found", 404);
    }
    return result.rows
  }

  static async patch(items, id) {
    let query = partialUpdate('users', items, 'username', id);
    let response = await db.query(query.query, query.values)
    let r = response.rows[0]
    let safeResponse = {username: r.username, first_name: r.first_name, last_name: r.last_name, email: r.email, photo_url: r.photo_url, is_admin: r.is_admin};
    return safeResponse;
  }

  static async delete(username) {
    let result = await db.query(`
    DELETE FROM users
    WHERE username = $1
    RETURNING username`, [username]);

    if (result.rows.length === 0) {
      throw new ExpressError('No user by that name found', 400)
    }
    return result.rows
  }
}

module.exports = User;