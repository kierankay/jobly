const express = require('express');
const router = express.Router();
const Job = require('../models/job');
const {ensureLoggedIn} = require('../middleware/middleware');

router.post('/', async function (req, res, next) {
  try {
    let result = await Job.create(req.body);
    return res.json(result[0]);
  } catch (err) {
    return next(err);
  }
});

router.get('/', async function (req, res, next) {
  try {
    console.log("SOMETHING LOUD")
    let query = req.query;
    let result = await Job.getAll(query)
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

router.get('/:id', ensureLoggedIn, async function (req, res, next) {
  try {
    let result = await Job.get(req.params.id);
    return res.json(result[0]);
  } catch (err) {
    return next(err);
  }
});

router.patch('/:id', async function (req, res, next) {
  try {
    let result = await Job.patch(req.body, req.params.id);
    return res.json(result[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:id', async function (req, res, next) {
  try {
    await Job.delete(req.params.id);
    return res.json({message: "Job deleted"});
  } catch(err) {
    return next(err);
  }
});

module.exports = router;