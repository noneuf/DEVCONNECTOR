const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
// @route     GET api/profile/me
// @desc      Get current users profile
// @access    Public
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user", //from where you want to take the the info
      ["name", "avatar"] // what you want to get from the user
    );

    if (!profile) {
      return res.status(400).json({ msg: "There is no profile for this user" });
    }

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route     POST api/profile
// @desc      Create or update users profile
// @access    Private
router.post(
  "/",
  [
    auth,
    [
      check("status", "Status is required").not().isEmpty(),
      check("skills", "Skills is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      bio,
      status,
      githubusername,
      skills,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin,
    } = req.body;

    // Build profile object
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (bio) profileFields.bio = bio;
    if (status) profileFields.status = status;
    if (company) profileFields.company = company;
    if (githubusername) profileFields.githubusername = githubusername;
    if (skills) {
      profileFields.skills = skills.split(",").map((skill) => skill.trim());
    }

    // Build social object
    profileFields.social = {};
    if (youtube) profileFields.youtube = youtube;
    if (twitter) profileFields.twitter = twitter;
    if (facebook) profileFields.facebook = facebook;
    if (linkedin) profileFields.linkedin = linkedin;
    if (instagram) profileFields.instagram = instagram;

    try {
      let profile = await Profile.findOne({ user: req.user.id });

      if (profile) {
        //If profile exists so we Update it
        profile = await Profile.findOneAndUpdate(
          { user: req.user.id },
          {
            $set: /*what is $set in mongoose: https://docs.mongodb.com/manual/reference/operator/aggregation/set/  */ profileFields,
          },
          { new: true } //set the "new" option to "true" to return the document after update was applied
        );
        return res.json(profile);
      }

      //Else profile does not exists so we Create it
      profile = new Profile(profileFields);

      await profile.save();
      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route     GET api/profile
// @desc      Get all profiles
// @access    Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", ["name", "avatar"]);
    res.json(profiles);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route     GET api/profile/user/:user_id
// @desc      Get profile by user ID
// @access    Public
router.get("/user/:user_id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.user_id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) return res.status(400).json({ msg: "Profile not found" });

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    // If the error is in the id we pass in ass a parmater of the request we want to return a specific message saying theprofile is not found
    if (err.kind == "ObjectId") {
      return res.status(400).json({ msg: "Profile not found" });
    }
    // if its any error that as nothing to do with the profile id we return server error message
    res.status(500).send("Server Error");
  }
});

// @route     DELETE api/profile
// @desc      Delete profile, user and posts
// @access    Private
router.delete("/", auth, async (req, res) => {
  try {
    // @todo - remove users posts
    // Remove profile
    await Profile.findOneAndDelete({ user: req.user.id });
    // Remove user
    await User.findOneAndDelete({ _id: req.user.id });
    res.json({ msg: "User deleted" });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route     PUT api/profile/experience
// @desc      Add profile experience
// @access    Private
router.put(
  "/experience",
  [
    auth,
    [
      check("title", "Title is required").not().isEmpty(),
      check("company", "Company is required").not().isEmpty(),
      check("from", "From date is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, descrption } =
      req.body;

    const newExp = {
      title, //remember this is a shortened syntax for: title: title
      company,
      location,
      from,
      to,
      current,
      descrption,
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });

      profile.experience.unshift(newExp); // The unshift() method adds new items to the beginning of an array, and returns the new length

      await profile.save();

      res.json(profile);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route     DELETE api/profile/experience/:exp_id
// @desc      Delete experience from profile
// @access    Private

router.delete("/experience/:exp_id", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id });

    //Get remove index
    const removeIndex = profile.experience
      .map((item) => item.id)
      .indexOf(req.params.exp_id);

    profile.experience.splice(removeIndex, 1);

    await profile.save();

    res.json(profile);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
