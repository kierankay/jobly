const express = require('express');
const router = express.Router();
const User = require('../models/user');
const ExpressError = require('../helpers/expressError');

const jsonschema = require('jsonschema');
const userPostSchema = require('../schemas/userPostSchema');
const userPatchSchema = require('../schemas/userPatchSchema');

router.post('/', async function (req, res, next) {
  try {
    const validation = jsonschema.validate(req.body, userPostSchema);

    if (!validation.valid) {
      let listOfErrors = validation.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    let result = await User.add(req.body)
    return res.json(result[0]);
  } catch (err) {
    return next(err);
  }
})

router.get('/', async function (req, res, next) {
  try {
    let result = await User.getAll();
    return res.json(result);
  } catch (err) {
    return next(err);
  }
})

router.get('/:username', async function (req, res, next) {
  try {
    let result = await User.get(req.params.username);
    return res.json(result[0]);
  } catch (err) {
    return next(err);
  }
})

router.patch('/:username', async function (req, res, next) {
  try {
    const validation = jsonschema.validate(req.body, userPatchSchema);

    if (!validation.valid) {
      let listOfErrors = validation.errors.map(error => error.stack);
      let error = new ExpressError(listOfErrors, 400);
      return next(error);
    }

    let result = await User.patch(req.body, req.params.username);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:username', async function (req, res, next) {
  try {
    let result = await User.delete(req.params.username);
    return res.json({message: "User deleted"});
  } catch (err) {
    return next(err);
  }
})

module.exports = router;