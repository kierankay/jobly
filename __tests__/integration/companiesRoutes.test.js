const request = require("supertest");
const jwt = require("jsonwebtoken");
const {
  SECRET_KEY
} = require("../../config");

const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/company");
const User = require('../../models/user')
let testToken1;

describe("Company Routes Test", function () {

  beforeEach(async function () {
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
      handle: "ESPN",
      name: "ESPN",
      num_employees: 4007,
      description: "Used to do sports, now it's shit tv.",
      logo_url: "https://www.multichannel.com/.image/t_share/MTU0MDYzNjQ2NTk2MzQyODY2/espn-logojpg.jpg"
    });

    let c2 = await Company.add({
      handle: "HGTV",
      name: "Home and Garden Television",
      num_employees: 1012,
      description: "House Hunters? Swapping Spaces? Come and get it.",
      logo_url: "https://upload.wikimedia.org/wikipedia/en/thumb/a/a8/HGTV_2010.svg/1200px-HGTV_2010.svg.png"
    });
  });

  /** VIEW ALL COMPANIES GET /companies => {[companies]} */
  describe("GET /companies", function () {
    test("can view all companies", async function () {
      let response = await request(app)
        .get("/companies/").send({
          _token: testToken1
        });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([{
          "handle": "ESPN",
          "name": "ESPN",
          "num_employees": 4007,
          "description": "Used to do sports, now it's shit tv.",
          "logo_url": "https://www.multichannel.com/.image/t_share/MTU0MDYzNjQ2NTk2MzQyODY2/espn-logojpg.jpg"
        },
        {
          "handle": "HGTV",
          "name": "Home and Garden Television",
          "num_employees": 1012,
          "description": "House Hunters? Swapping Spaces? Come and get it.",
          "logo_url": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a8/HGTV_2010.svg/1200px-HGTV_2010.svg.png"
        }
      ]);
    });

    test("can search for companies by handle", async function () {
      let response = await request(app)
        .get("/companies?search=ESPN").send({
          _token: testToken1
        });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([{
        "handle": "ESPN",
        "name": "ESPN",
        "num_employees": 4007,
        "description": "Used to do sports, now it's shit tv.",
        "logo_url": "https://www.multichannel.com/.image/t_share/MTU0MDYzNjQ2NTk2MzQyODY2/espn-logojpg.jpg"
      }]);
    });

    test("can search for companies by min_employees", async function () {
      let response = await request(app)
        .get("/companies?min_employees=1500").send({
          _token: testToken1
        });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([{
        "handle": "ESPN",
        "name": "ESPN",
        "num_employees": 4007,
        "description": "Used to do sports, now it's shit tv.",
        "logo_url": "https://www.multichannel.com/.image/t_share/MTU0MDYzNjQ2NTk2MzQyODY2/espn-logojpg.jpg"
      }]);
    });

    test("can search for companies by max_employees", async function () {
      let response = await request(app)
        .get("/companies?max_employees=1500").send({
          _token: testToken1
        });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([{
        "handle": "HGTV",
        "name": "Home and Garden Television",
        "num_employees": 1012,
        "description": "House Hunters? Swapping Spaces? Come and get it.",
        "logo_url": "https://upload.wikimedia.org/wikipedia/en/thumb/a/a8/HGTV_2010.svg/1200px-HGTV_2010.svg.png"
      }]);
    });

    test("get 400 error if trying to search where min_employees > max_employees", async function () {
      let response = await request(app)
        .get("/companies?min_employees=50&max_employees=40").send({
          _token: testToken1
        });
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        "status": 400,
        "message": "min employees not allowed to be greater than max employees"
      });
    });

    test("searching for handle that doesn't exist returns empty array", async function () {
      let response = await request(app)
        .get("/companies?search=aslkdf").send({
          _token: testToken1
        });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([]);
    });
  });

  /** CREATE A NEW COMPANY POST /companies */
  describe("POST /companies", function () {
    test("can create a new company", async function () {
      let response = await request(app)
        .post("/companies/")
        .send({
          "handle": "Blind",
          "name": "Blind Skateboards",
          "num_employees": 144,
          "description": "Make skateboards and fuck shit up.",
          "logo_url": "https://www.longboarderlabs.com/wp-content/uploads/2019/03/blind-logo-300x300-trans.png",
          _token: testToken1
        });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        "handle": "Blind",
        "name": "Blind Skateboards",
        "num_employees": 144,
        "description": "Make skateboards and fuck shit up.",
        "logo_url": "https://www.longboarderlabs.com/wp-content/uploads/2019/03/blind-logo-300x300-trans.png"
      });
    });
  });

  /** VIEW ONE SPECIFIC COMPANY GET /companies/:handle => {company} */
  describe("GET /companies/ESPN", function () {
    test("can view specific company", async function () {
      let response = await request(app)
        .get("/companies/ESPN").send({
          _token: testToken1
        });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        "company": {
          "handle": "ESPN",
          "name": "ESPN",
          "num_employees": 4007,
          "description": "Used to do sports, now it's shit tv.",
          "logo_url": "https://www.multichannel.com/.image/t_share/MTU0MDYzNjQ2NTk2MzQyODY2/espn-logojpg.jpg",
          "jobs": [{
            "title": null,
            "salary": null,
            "equity": null,
            "date_posted": null
          }]
        }
      });
    });
    test("get 404 error when company not found", async function () {
      let response = await request(app)
        .get("/companies/garbanzo").send({
          _token: testToken1
        });
      expect(response.status).toEqual(404);
      expect(response.body).toEqual({
        "status": 404,
        "message": "Company not found"
      });
    });
  });

  /** UPDATE AN EXISTING COMPANY PATCH /companies/:handle => {company} */
  describe("PATCH /companies/:handle", function () {
    test("can update an existing company", async function () {
      let response = await request(app)
        .patch("/companies/ESPN")
        .send({
          "logo_url": "https://dailycaller.com/cdn-cgi/image/width=960,height=411,fit=cover,f=auto/https://cdn01.dailycaller.com/wp-content/uploads/2017/07/GettyImages-508675272-e1505312548376.jpg",
          _token: testToken1
        });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        "handle": "ESPN",
        "name": "ESPN",
        "num_employees": 4007,
        "description": "Used to do sports, now it's shit tv.",
        "logo_url": "https://dailycaller.com/cdn-cgi/image/width=960,height=411,fit=cover,f=auto/https://cdn01.dailycaller.com/wp-content/uploads/2017/07/GettyImages-508675272-e1505312548376.jpg"
      })
    });
    test("get 404 error when company not found", async function () {
      let response = await request(app)
        .patch("/companies/garbanzo")
        .send({
          "name": "BUFFALOBUFFALOBUFFALO",
          _token: testToken1
        });
      expect(response.status).toEqual(404);
      expect(response.body).toEqual({
        "status": 404,
        "message": "Company not found"
      });
    });
  });

  /** DELETE AN EXISTING COMPANY DELETE /companies/:handle {message: "Company deleted"} */
  describe("DELETE /companies/:handle", function () {
    test("can delete an existing company", async function () {
      let response = await request(app)
        .delete("/companies/ESPN").send({
          _token: testToken1
        });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        "message": "Company deleted"
      });
    });
    test("get 400 error when company not found", async function () {
      let response = await request(app)
        .delete("/companies/garbanzo").send({
          _token: testToken1
        });
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        "status": 400,
        "message": "Company not found"
      });
    });
  });
  afterAll(async function () {
    await db.end();
  });
});