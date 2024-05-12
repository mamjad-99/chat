const mongoose = require("mongoose");

const FriendsSchema = new mongoose.Schema(
  {
    myId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    myFriendId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const FriendsModel = mongoose.model("Friends", FriendsSchema);
module.exports = FriendsModel;
