const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const {
  check,
  validationResult,
} = require("express-validator" /*was express-validator/check but is deprecated so we do not use /check anymore.*/);

const User = require("../../models/User");

// @route     GET api/users
// @desc      Register user
// @access    Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "PLease include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // desctructuring
    const { name, email, password } = req.body;

    try {
      // See if the user exists
      let user = await User.findOne({
        email /*because the key and the value have the same name whe can shorten the syntx, but in fact it looks like that: email: eamail*/,
      });

      if (user) {
        res.status(400).json({ errors: [{ msg: "User allready exists" }] });
      }

      //Get users gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      // Creates a new user object
      user = new User({
        name,
        email,
        avatar,
        password,
      });

      // Encrypt password

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save(); /*this save or update a user in the db, its mongoose syntax*/

      //Return jsonwebtoken so that user gets loged in as soon as they send a request to log in
      res.send("User registered");
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
