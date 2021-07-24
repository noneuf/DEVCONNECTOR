const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  text: {
    type: String,
    required: true,
  },
  name: {
    // This object is destined to be used so that we can reference a post even after the user deletes is acount, so that the its name would be displayed still.
    type: String,
  },
  avatar: {
    type: String,
  },
  likes: [
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "users",
      },
    },
  ],
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId, // Need to understand this
        ref: "users",
      },
      text: {
        type: String,
        required: true,
      },
      name: {
        //this object is destined to be used so that we can reference a post even after the user deletes is acount, so that the its name would be displayed still.
        type: String,
      },
      date: {
        // The date of the comment
        type: Date,
        default: Date.now,
      },
    },
  ],
  date: {
    // The date of the post
    type: Date,
    default: Date.now,
  },
});

module.exports = Post = mongoose.model("post", PostSchema);
