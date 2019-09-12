const request = require("supertest");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

const app = require("../app");
const db = require("../db");

describe("Company Routes Test", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM companies");

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

  /** VIEW ALL COMPANIES GET / => {[companies]} */
  describe("GET /users", function () {
    test("can view all users", async function () {
      let response = await request(app)
        .get("/users/")
        .send({ _token: testToken1 });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        {
          "username": "test1",
          "first_name": "TestFirstName",
          "last_name": "TestLastName"
        },
        {
          "username": "test2",
          "first_name": "TestFirstName2",
          "last_name": "TestLastName2"
        }
      ]);
    });
  });

});
