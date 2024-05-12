const mongoose = require("mongoose");

const RequestSchema = new mongoose.Schema(
  {
    requestSender: {
      type: mongoose.Schema.Types.ObjectId,
    //   type:String,
      ref: "User",
    },
    requestReceiver: {
        // type:String,
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const RequestModel = mongoose.model("Request", RequestSchema);
module.exports = RequestModel;
