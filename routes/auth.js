const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { body, validationResult } = require("express-validator"); //used for data validation
const bcrypt = require("bcryptjs"); //use for password security
const jwt = require("jsonwebtoken"); //use for authToken
const fetchUser = require("../middleware/fetchuser");

const JWT_TOKEN = "Welcome$sad";


//Route1: "api/auth/createuser" for signup
router.post(
  "/createuser",
  [
    body("name", "name must be of 5 character").isLength({ min: 5 }),
    body("email", "enter valid email").isEmail(),
    body("password", "password is of more than 5").isLength({ min: 5 }),
  ],
  async (req, res) => {
    //validation checker
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.json({status:false, errors: result.array() }); //if got any errors it will return the error
    }
    try {
      //checking email if it exist so it end the execution with error message
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({status:false, errors: "Sorry email exist" });
      }
      const salt = await bcrypt.genSalt(10); //generating salt
      const secPass = await bcrypt.hash(req.body.password, salt); //generating hash
      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      }); // creating user
      const data = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data, JWT_TOKEN); //generatin authtoken with jwt

      res.json({status:true, authToken });
    } catch (err) {
      console.error(err.message);
      res.status(500).json({status:false, errors: "Internal Server Error" });
    }
  }
);


//Route2: "api/auth/login" for login
router.post(
  "/login",
  [
    body("email", "Enter a valid Email").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      return res.json({status:false, errors: result.array() });
    }
    const { email, password } = req.body;
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({status:false, error: "Please try to login with correct credential" });
      }
      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({status:false, error: "Please try to login with correct credential" });
      }
      const payload = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(payload, JWT_TOKEN);
      res.json({status:true, authToken });
    }  catch (err) {
      console.error(err.message);
      res.status(500).json({status:false, error: "Internal server error" });
    }
  }
);


//Route3: "api/auth/getuser" for getting user details
router.post("/getuser", fetchUser, async (req, res) => {
  try {
    const userid=req.user.id
    const user = await User.findById(userid).select("-password");
    res.json(user)
  }  catch (err) {
    console.error(err.message);
    res.status(500).json({status:false, error: "Internal server error" });
  }
});


module.exports = router;
