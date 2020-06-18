import mongoose from "mongoose";

const ProcessSchema = new mongoose.Schema({
  fileName: {
    type: String,
    required: "File name is required",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: "User id is required",
  },
  pid: {
    type: Number,
    required: "pid is required",
  },
  status: {
    type: String,
    required: "Status is required",
  },
  step: {
    type: Number,
    required: "Step is required",
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const model = mongoose.model("Process", ProcessSchema);
export default model;
