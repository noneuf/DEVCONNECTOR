const mongoose = require("mongoose");
const config = require("config");
const db = config.get("mongoURI");

const connectDB = async () => {
  try {
    await mongoose.connect(db, {
      useFindAndModify: false, //DeprecationWarning: Mongoose: `findOneAndUpdate()` and `findOneAndDelete()` without the `useFindAndModify`
      //option set to false are deprecated so we use it here when connecting to the db
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("MongoDB Connected...");
  } catch (err) {
    console.log(err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
