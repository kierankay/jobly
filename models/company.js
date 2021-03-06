const db = require('../db');
const ExpressError = require('../helpers/expressError');
const partialUpdate = require('../helpers/partialUpdate');

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
    return result.rows;
  }

  static async add({ handle, name, num_employees, description, logo_url }) {
    let result = await db.query(`
      INSERT INTO companies
      (handle, name, num_employees, description, logo_url)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING handle, name, num_employees, description, logo_url
    `, [handle, name, num_employees, description, logo_url]);

    return result.rows;
  }

  static async get(handle) {
    let result = await db.query(`
      SELECT *
      FROM companies
      LEFT JOIN jobs
      ON companies.handle = jobs.company_handle
      WHERE companies.handle=$1
    `, [handle]);

    if (result.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    };
    
    let jobsArr = [];
    for (let row of result.rows) {
      let obj = {
        title: row.title,
        salary: row.salary,
        equity: row.equity,
        date_posted: row.date_posted
      }
      jobsArr.push(obj);
    }
    let co = result.rows[0];
    let companyObj = {
      handle: co.handle,
      name: co.name,
      num_employees: co.num_employees,
      description: co.description,
      logo_url: co.logo_url,
      jobs: jobsArr
    }

    return companyObj;
  }

  static async patch(items, id) {
    let query = partialUpdate('companies', items, 'handle', id);
    let result = await db.query(query.query, query.values);
    if (result.rows.length === 0) {
      throw new ExpressError("Company not found", 404);
    }
    return result.rows;
  }

  static async delete(id) {
    let result = await db.query(`
      DELETE FROM companies
      WHERE handle=$1
      RETURNING handle, name
    `, [id]);
    if (result.rows.length === 0) {
      throw new ExpressError("Company not found", 400);
    }
    return result.rows;
  }
}

function processArgs(arg, string, statementParams, queryString, idx) {
  if(arg) {
    queryString.push(string);
    statementParams.push(arg);
    idx += 1;
  }
  return idx
}

module.exports = Company;