const jwt = require('jsonwebtoken');
const {SECRET_KEY} = require('../config')
const ExpressError = require('../helpers/expressError')

function authenticateJWT(req, res, next) {
  try {
    const tokenFromBody = req.body._token;
    const payload = jwt.verify(tokenFromBody, SECRET_KEY);
    req.user = payload; // create a current user
    return next();
  } catch (err) {
    return next();
  }
}

function ensureLoggedIn(req, res, next) {
  if (!req.user) {
    return next({ status: 401, message: "Unauthorized" });
  } else {
    return next();
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn
}