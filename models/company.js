const db = require('../db');
const ExpressError = require('../helpers/expressError')

class Company {
  static async getAll({
    search,
    min_employees,
    max_employees
  }) {
    if (parseInt(min_employees) > parseInt(max_employees)) {
      throw new ExpressError('min employees not allowed to be greater than max employees', 400);
    }

    let idx = 1;
    let statementParams = [];
    let queryString = [];

    idx = processArgs(search, `$${idx} iLIKE CONCAT('%',handle,'%') 
      or handle iLIKE CONCAT('%',$${idx},'%')`, statementParams, queryString, idx)
    idx = processArgs(min_employees, `num_employees >= $${idx}`, statementParams, queryString, idx)
    idx = processArgs(max_employees, `num_employees <= $${idx}`, statementParams, queryString, idx)
    
    queryString = queryString.join(' AND ');
    
    let finalQueryString;
    if (queryString) {
      finalQueryString = 'WHERE ' + queryString;
    }

    let result = await db.query(`
    SELECT *
    FROM companies
    ${finalQueryString}
    `, statementParams);
    return result;
  }
}

function processArgs(arg, string, statementParams, queryString, idx) {
  queryString.push(string);
  statementParams.push(arg);
  idx += 1;
  return idx
}

module.exports = Company;