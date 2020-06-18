import mongoose from "mongoose";

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: "Title is required",
  },
  description: String,
  updateDate: {
    type: Date,
    default: Date.now,
  },
  model: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Model",
    required: "Model id is required",
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: "User id is required",
  },
  sketchfabId: {
    type: String,
    required: "Sketchfab model id is required",
  },
  sketchfabModelLocation: {
    type: String,
    required: "Sketchfab model location is required",
  },
  status: {
    type: String,
    required: "Status is required",
  },
  thumbnail: {
    type: String,
  },
});

const model = mongoose.model("Post", PostSchema);
export default model;
