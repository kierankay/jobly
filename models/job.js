const db = require('../db');
const ExpressError = require('../helpers/expressError');
const partialUpdate = require('../helpers/partialUpdate');

class Job {
  static async create({
    title,
    salary,
    equity,
    company_handle
  }) {
    try {
      let result = await db.query(`
      INSERT INTO jobs
      (title, salary, equity, company_handle)
      VALUES ($1, $2, $3, $4)
      RETURNING title, salary, equity, company_handle
    `, [title, salary, equity, company_handle]);

      return result.rows;
    } catch (err) {
      throw new ExpressError('Unable to create job, check required formatting', 400)
    }
  }

  static async getAll({
    search,
    min_salary,
    min_equity
  }) {
    let idx = 1;
    let statementParams = [];
    let queryString = [];

    idx = processArgs(search, `$${idx} iLIKE CONCAT('%',company_handle,'%') 
    or company_handle iLIKE CONCAT('%',$${idx},'%')
    or $${idx} iLIKE CONCAT('%',title,'%')
    or title iLIKE CONCAT('%',$${idx},'%')`,
      statementParams, queryString, idx)

    idx = processArgs(min_salary, `salary >= $${idx}`, statementParams, queryString, idx)
    idx = processArgs(min_equity, `equity >= $${idx}`, statementParams, queryString, idx)

    queryString = queryString.join(' AND ');

    let finalQueryString;
    if (queryString) {
      finalQueryString = 'WHERE ' + queryString;
    }

    let result = await db.query(`
    SELECT *
    FROM jobs
    ${finalQueryString}
    `, statementParams);
    return result.rows;
  }

  static async get(id) {
    let result = await db.query(`
    SELECT * FROM jobs
    WHERE id=$1`, [id]);

    if (result.rows.length === 0) {
      throw new ExpressError(`That job doesn't exist`, 404)
    }

    return result.rows;
  }

  static async patch(items, id) {
    try {
      let query = partialUpdate('jobs', items, 'id', id);
      let response = await db.query(query.query, query.values);

      return response.rows;
    } catch (err) {
      throw new ExpressError("Unable to update job, check formatting", 400)
    }
  }

  static async delete(id) {
    let result = await db.query(`
      DELETE FROM jobs
      WHERE id=$1
      RETURNING id, title
    `, [id]);
    if (result.rows.length === 0) {
      throw new ExpressError("Job not found", 400);
    }
    return result.rows;
  }
}

function processArgs(arg, string, statementParams, queryString, idx) {
  if (arg) {
    queryString.push(string);
    statementParams.push(arg);
    idx += 1;
  }
  return idx
}

module.exports = Job;