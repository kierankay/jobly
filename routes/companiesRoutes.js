const express = require('express');
const router = express.Router();
const Company = require('../models/company');

router.get('/', async function(req, res, next ){
  try {
    let query = req.query;
    let result = await Company.getAll(query)
    return res.json(result.rows);
  }
  catch (err) {
    next(err);
  }
})

router.post('/', function(req, res, next ){
  
})
router.get('/:handle', function(req, res, next ){
  
})
router.patch('/:handle', function(req, res, next ){
  
})
router.delete('/:handle', function(req, res, next ){
  
})

module.exports = router;