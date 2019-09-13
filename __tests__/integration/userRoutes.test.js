const request = require("supertest");
const User = require("../../models/user");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../../config");

const app = require("../../app");
const db = require("../../db");

describe("User routes test", function () {

  let testToken1;
  let testToken2;

  beforeEach(async function () {
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

    let u2 = await User.add({
      username: "pureevil",
      password: "password",
      first_name: "John",
      last_name: "Travolta",
      email: "pieceofshit@john.travolta",
      photo_url: "https://m.media-amazon.com/images/M/MV5BMTUwNjQ0ODkxN15BMl5BanBnXkFtZTcwMDc5NjQwNw@@._V1_.jpg",
      is_admin: false
    });

    u1 = u1[0];
    u2 = u2[0];

    let payload1 = {
      username: u1.username,
      is_admin: u1.is_admin
    };
    testToken1 = jwt.sign(payload1, SECRET_KEY);

    let payload2 = {
      username: u2.username,
      is_admin: u2.is_admin
    };
    testToken2 = jwt.sign(payload2, SECRET_KEY);
  });

  describe("POST /", function () {
    test("Add a user", async function () {
      let response = await request(app)
        .post("/users")
        .send({
          username: "slam",
          password: "password",
          first_name: "slam",
          last_name: "slam",
          email: "slam@slam.slam",
          photo_url: "https://www.gannett-cdn.com/media/USATODAY/USATODAY/2013/05/31/1370038951000-birdmansuspension-1305311824_3_4.jpg?width=534&height=712&fit=crop",
          is_admin: false
        });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        _token: expect.any(String)
      });
    });
    test("Add an imcomplete user => 400 error", async function () {
      let response = await request(app)
        .post("/users")
        .send({
          username: "slam",
          first_name: "slam",
          last_name: "slam",
          email: "slam@slam.slam",
          photo_url: "https://www.gannett-cdn.com/media/USATODAY/USATODAY/2013/05/31/1370038951000-birdmansuspension-1305311824_3_4.jpg?width=534&height=712&fit=crop",
          is_admin: false
        });
      expect(response.status).toEqual(400);
      expect(response.body).toEqual({
        message: expect.any(Array),
        status: 400
      });
    });
  });

  describe("GET /", function () {
    test("Get all users", async function () {
      let response = await request(app)
        .get("/users");
      expect(response.status).toEqual(200);
      expect(response.body).toEqual([
        {
          "username": "onetruegod",
          "first_name": "Nic",
          "last_name": "Cage",
          "email": "nic@cage.onetruegod",
          "photo_url": "https://www.monstersandcritics.com/wp-content/uploads/2019/06/nic-cage-eyes.jpg",
          "is_admin": true
        },
        {
          "username": "pureevil",
          "first_name": "John",
          "last_name": "Travolta",
          "email": "pieceofshit@john.travolta",
          "photo_url": "https://m.media-amazon.com/images/M/MV5BMTUwNjQ0ODkxN15BMl5BanBnXkFtZTcwMDc5NjQwNw@@._V1_.jpg",
          "is_admin": false
        }
      ]);
    });
  });

  describe("GET /:username", function () {
    test("Get a specific user by username", async function () {
      let response = await request(app)
        .get("/users/onetruegod");
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        "username": "onetruegod",
        "first_name": "Nic",
        "last_name": "Cage",
        "email": "nic@cage.onetruegod",
        "photo_url": "https://www.monstersandcritics.com/wp-content/uploads/2019/06/nic-cage-eyes.jpg",
        "is_admin": true
      });
    });
    test("get 404 error when user not found", async function () {
      let response = await request(app)
        .get("/users/buffalobill");
      expect(response.status).toEqual(404);
      expect(response.body).toEqual({
        "status": 404,
        "message": "User not found"
      });
    });
  });

  describe("PATCH /:username", function () {
    test("Edit a specific user by username", async function () {
      let response = await request(app)
        .patch("/users/pureevil")
        .send({
          _token: testToken2,
          last_name: "Buttface"
        });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        "username": "pureevil",
        "first_name": "John",
        "last_name": "Buttface",
        "email": "pieceofshit@john.travolta",
        "photo_url": "https://m.media-amazon.com/images/M/MV5BMTUwNjQ0ODkxN15BMl5BanBnXkFtZTcwMDc5NjQwNw@@._V1_.jpg",
        "is_admin": false
      });
    });
    test("Get a 401 if not correct user", async function () {
      let response = await request(app)
        .patch("/users/pureevil")
        .send({
          _token: testToken1,
          last_name: "Buttface"
        });
      expect(response.status).toEqual(401);
      expect(response.body).toEqual({
        message: "Unauthorized",
        status: 401
      });
    });
  });

  describe("DELETE /:username", function () {
    test("Delete a specific user by username", async function () {
      let response = await request(app)
        .delete("/users/pureevil")
        .send({
          _token: testToken2
        });
      expect(response.status).toEqual(200);
      expect(response.body).toEqual({
        message: "User deleted"
      });
    });
    test("Get a 401 ifg not correct user", async function () {
      let response = await request(app)
        .delete("/users/pureevil")
        .send({
          _token: testToken1
        });
      expect(response.status).toEqual(401);
      expect(response.body).toEqual({
        message: "Unauthorized",
        status: 401
      });
    });
  });


  afterAll(async function () {
    await db.end();
  });
});