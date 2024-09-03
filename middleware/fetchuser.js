const jwt = require("jsonwebtoken");
const JWT_TOKEN = "Welcome$sad";

const fetchUser = (req, res, next) => {
//recieving auth token from header and verifying it
  const token = req.header("auth-token");
  if (!token) {
    res.status(401).send({ error: "Missmatch Token" });
  }
  try {
    const data = jwt.verify(token, JWT_TOKEN);
    req.user = data.user;
    next();
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal server error");
  }
};
module.exports = fetchUser;
