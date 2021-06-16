const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("config");

const {
  check,
  validationResult,
} = require("express-validator" /*was express-validator/check but is deprecated so we do not use /check anymore.*/);

const User = require("../../models/User");

// @route     GET api/auth
// @desc      Test route
// @access    Public
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route     GET api/auth
// @desc      Authenticate user & get token
// @access    Public
router.post(
  "/",
  [
    check("email", "PLease include a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // desctructuring
    const { email, password } = req.body;

    try {
      // See if the user exists
      let user = await User.findOne({
        email /*because the key and the value have the same name whe can shorten the syntx, but in fact it looks like that: email: eamail*/,
      });

      if (!user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      // Here we want to have a a comparison betwen the plain text password (password) that the user is inputing and the incrypted password (user.password) that is comming back from the DB
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res
          .status(400)
          .json({ errors: [{ msg: "Invalid Credentials" }] });
      }

      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtSecret"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
