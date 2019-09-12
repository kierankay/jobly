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

function ensureCorrectUser(req, res, next) {
  try {
    if (req.user.username === req.params.username) {
      return next();
    } else {
      return next({ status: 401, message: "Unauthorized" });
    }
  } catch (err) {
    // errors would happen here if we made a request and req.user is undefined
    return next({ status: 401, message: "Unauthorized" });
  }
}

function ensureIsAdmin(req, res, next) {
  try {
    if(req.user.is_admin){
      return next();
    } else {
      return next({status: 401, message: "Unauthorized: Must be an Admin"})
    }
  } catch (err) {
    return next({status: 401, message: "Unauthorized: Must be an Admin"})
  }
}

module.exports = {
  authenticateJWT,
  ensureLoggedIn,
  ensureCorrectUser,
  ensureIsAdmin
}