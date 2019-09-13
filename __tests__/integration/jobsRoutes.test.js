const request = require("supertest");
const Company = require("../../models/company");
const Job = require("../../models/job");
const jwt = require("jsonwebtoken");
const {
  SECRET_KEY
} = require("../../config");

const app = require("../../app");
const db = require("../../db");
const User = require('../../models/user')
let testToken1;
describe("Jobs routes test", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM jobs");
    await db.query("DELETE FROM companies");
    await db.query("DELETE FROM users");

    let u1 = await User.add({
      username: "onetruegod",
      password: "password",
      first_name: "Nic",
      last_name: "Cage",
      email: "nic@cage.onetruegod",
      photo_url: "https://www.monstersandcritics.com/wp-content/uploads/2019/06/nic-cage-eyes.jpg",
      is_admin: true
    });

    u1 = u1[0];

    let payload1 = {
      username: u1.username,
      is_admin: u1.is_admin
    };
    testToken1 = jwt.sign(payload1, SECRET_KEY);

    let c1 = await Company.add({
      handle: "Cuba",
      name: "Dictator's Republic of Cuba",
      num_employees: 4000000,
      description: "Rapidly descending into chaos",
      logo_url: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a4/Flag_of_the_United_States.svg/1280px-Flag_of_the_United_States.svg.png"
    });

    let j1 = await Job.create({
      title: "Dictator",
      salary: 400000,
      equity: 1,
      company_handle: "Cuba"
    });

    let j2 = await Job.create({
      title: "Vice Dictator",
      salary: 150000,
      equity: 0,
      company_handle: "Cuba"
    });
  });

  describe("POST /", function () {
    test("Successfully adding", async function () {
      let response = await request(app)
        .post('/jobs')
        .send({
          title: "Chief Propagandist",
          salary: 150000,
          equity: 0,
          company_handle: "Cuba",
          _token: testToken1
        });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        title: "Chief Propagandist",
        salary: 150000,
        equity: 0,
        company_handle: "Cuba"
      });
    });

    test("Failed adding", async function () {
      let response = await request(app)
        .post('/jobs')
        .send({
          title: "Chief Propagandist",
          salary: "Too High",
          equity: "something else",
          company_handle: "Cuba",
          _token: testToken1
        });

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        message: "Unable to create job, check required formatting",
        status: 400
      });
    });
  });

  describe("GET /", function () {
    test("Successfully getting multiple jobs", async function () {
      let response = await request(app)
        .get('/jobs').send({
          _token: testToken1
        });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual([{
          title: "Dictator",
          date_posted: expect.any(String),
          id: expect.any(Number),
          salary: 400000,
          equity: 1,
          company_handle: "Cuba"
        },
        {
          title: "Vice Dictator",
          date_posted: expect.any(String),
          id: expect.any(Number),
          salary: 150000,
          equity: 0,
          company_handle: "Cuba"
        }
      ]);
    });
  });

  describe("GET /:id", function () {
    test("Successfully get a specific job", async function () {
      let search = await request(app)
        .get('/jobs').send({
          _token: testToken1
        });
      let validId = search.body[0].id;

      let response = await request(app)
        .get(`/jobs/${validId}`).send({
          _token: testToken1
        });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        title: "Dictator",
        date_posted: expect.any(String),
        id: expect.any(Number),
        salary: 400000,
        equity: 1,
        company_handle: "Cuba"
      });
    });

    test("Fail getting a job that doesn't exist", async function () {
      let response = await request(app)
        .get(`/jobs/0`).send({
          _token: testToken1
        });

      expect(response.status).toEqual(404);
      expect(response.body).toEqual({
        message: "That job doesn't exist",
        status: 404
      });
    });
  });

  describe("PATCH /:id", function () {
    test("Successfully patch an existing job", async function () {
      let search = await request(app)
        .get('/jobs').send({
          _token: testToken1
        });
      let validId = search.body[0].id;

      let response = await request(app)
        .patch(`/jobs/${validId}`)
        .send({
          equity: 0,
          _token: testToken1
        });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        title: "Dictator",
        date_posted: expect.any(String),
        id: expect.any(Number),
        salary: 400000,
        equity: 0,
        company_handle: "Cuba"
      });
    });

    test("Fail at patching an existing job", async function () {
      let search = await request(app)
        .get('/jobs').send({
          _token: testToken1
        });
      let validId = search.body[0].id;

      let response = await request(app)
        .patch(`/jobs/${validId}`)
        .send({
          equity: "EVERYTHING!",
          _token: testToken1
        });

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        message: "Unable to update job, check formatting",
        status: 400
      });
    });
  });

  describe("DELETE /:id", function () {
    test("Successfully delete specific job", async function () {
      let search = await request(app)
        .get('/jobs').send({
          _token: testToken1
        });
      let validId = search.body[0].id;

      let response = await request(app)
        .delete(`/jobs/${validId}`).send({
          _token: testToken1
        });

      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        message: "Job deleted"
      });
    });

    test("Fail to delete a non-existent job", async function () {
      let response = await request(app)
        .delete(`/jobs/0`).send({
          _token: testToken1
        });

      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        message: "Job not found",
        status: 400
      });
    });
  });

  afterAll(async function () {
    await db.end();
  });
});