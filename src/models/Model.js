import mongoose from "mongoose";

const ModelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: "User is required",
  },
  modelName: {
    type: String,
    required: "Model name is required",
  },
  modelLocation: {
    type: String,
    required: "Model Location is required",
  },
  uploadDate: {
    type: Date,
    default: Date.now,
  },
});

const model = mongoose.model("Model", ModelSchema);
export default model;
