const express = require("express");
const User = require("../models/User");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var fetchUser = require('../middleware/fetchUser');
const JWT_SECRET = 'ROhit is programmer';
//route 1
//create user using: Post "/api/auth/createuser" . Doesn't require login
router.post(
  "/createuser",
  [
    body("email").isEmail(),
    body("name", "Enter valid name").isLength({ min: 3 }),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    let success = false;
    //on Errors return bad request and errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    //check if there already exsists the user with email
    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        success = false;
        return res
          .status(400)
          .json({sucess: success ,  error: "sorry user with this email already exists" });
         
      }
      else{
        success = true;
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
      res.json({success , authToken});
    } catch (error) {
      console.error(error.message);
      res.status(500).send("internal server error");
    }
  }
);
//route 2
//Authentication/ login using "/api/auth/login" . NO login needed
//first we are s=checking wether user entered valid email and non empty password
router.post("/login", [
  body('email' , 'Enter a Valid Email').isEmail(),
  body('password' , "Password can't be blank").exists(),
] , async(req , res) => {
  let success = false;
  //returns error 
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  const {email , password} = req.body;
  //we try  to get and compare email
  try {
    let user = await User.findOne({email});
    if(!user){
      return res.status(400).json({error: "Wrong Credentials"});
    }
//here we take password and compare there hash
    const passCompare = await bcrypt.compare(password , user.password);
    if(!passCompare){ 
      success = false;
      return res.status(400).json({success , error: "Wrong Credentials"});
    }
    // creating payload
    const data = {
      user:{
        id: user.id
      }
    }
    const authToken = jwt.sign(data , JWT_SECRET);
    const name = user.name ;
    success = true;
    //we provide a token to user 
    res.json({success , authToken , name});
  } catch (error) {
    console.error(error.message);
    res.status(500).send("internal server error");
  }
}
 
);

//Route 3: Retrieving logined user info "/api/auth/getuser". login required
router.post("/getuser",  fetchUser ,  async(req , res) => {
try {
  userID = req.user.id
  const user = await User.findById(userID).select("-password")
  res.send(user);
} catch (error) {
  console.error(error.message);
      res.status(500).send("internal server error");
}
})
module.exports = router;
