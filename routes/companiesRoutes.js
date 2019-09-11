const express = require('express');
const router = express.Router();
const Company = require('../models/company');

router.get('/', async function (req, res, next) {
  try {
    let query = req.query;
    let result = await Company.getAll(query)
    return res.json(result);
  } catch (err) {
    return next(err);
  }
});

router.post('/', async function (req, res, next) {
  try {
    let result = await Company.add(req.body);
    return res.json(result[0]);
  } catch (err) {
    return next(err);
  }
});

router.get('/:handle', async function (req, res, next) {
  try {
    let result = await Company.get(req.params.handle);
    return res.json({
      company: result
    });
  } catch (err) {
    return next(err);
  }
});

router.patch('/:handle', async function (req, res, next) {
  try {
    let result = await Company.patch(req.body, req.params.handle);
    return res.json(result[0]);
  } catch (err) {
    return next(err);
  }
});

router.delete('/:handle', async function (req, res, next) {
  try {
    await Company.delete(req.params.handle);
    return res.json({
      message: "Company deleted"
    });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;