const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');

const JWT_SECRET = 'ROhit is programmer';
//create use using: Post "/api/auth/createuser" . Doesn't require login
router.post(
  "/createuser",
  [
    body("email").isEmail(),
    body("name", "Enter valid name").isLength({ min: 3 }),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    //on Errors return bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //check if there already exsists the user with email
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "sorry user with this email already exists" });
      }
      const salt = await bcrypt.genSalt(10);
      secPass = await bcrypt.hash(req.body.password , salt);
      user = await User.create({
        name: req.body.name,
        password: secPass,
        email: req.body.email,
      });

      //   .then(user => res.json(user))
      //   .catch(err => {console.log(err)
      //   res.json({error: 'pls enter uniques value' , message: err.message})
      // })
      //    console.log(req.body);
       const data = {
         user:{
           id: user.id
         }
       }
       //signs and creates Token for the user
      const authToken = jwt.sign(data , JWT_SECRET);
      //we provide a token to user 
      res.json({authToken});
    } catch (error) {
      console.error(error.message);
      res.status(500).send("some error occured");
    }
  }
);

module.exports = router;
