const jwt = require("jsonwebtoken");
const {SECRET_KEY} = require("../config");

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

module.exports = { ensureCorrectUser, ensureIsAdmin };