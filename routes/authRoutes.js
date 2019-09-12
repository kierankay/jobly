const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {
  SECRET_KEY
} = require('../config')
const User = require('../models/user');

router.post('/login', async function (req, res, next) {
  try {
    let loginData = req.body
    let result = await User.login(loginData);
    let hashedPassword = result[0].password
    let isAdmin = result[0].is_admin
    let validatedPassword = bcrypt.compare(loginData.password, hashedPassword)

    if (validatedPassword) {
      let token = jwt.sign({
        username: loginData.username,
        is_admin: isAdmin
      }, SECRET_KEY)
      return res.json({
        _token: token
      })
    } else {
      return res.json({
        message: "invalid username or password"
      })
    }
  } catch (err) {
    return next(err);
  }
});

module.exports = router;