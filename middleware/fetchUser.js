var jwt = require("jsonwebtoken");
const JWT_SECRET = "ROhit is programmer";

//we fetch user and pass to next function by next
const fetchUser = (req, res, next) => {
  //getting the user from jwt token and adding id to required objects
  const tooken = req.header("auth-token");
  if (!tooken) {
    res.status(401).send({ error: "pls authenticate using valid token" });
  }
  try {
    const data = jwt.verify(tooken, JWT_SECRET);
    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).send({ error: "pls authenticate using valid token" });
  }
};

module.exports = fetchUser;
