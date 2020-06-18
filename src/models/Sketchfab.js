import mongoose from "mongoose";

const SketchfabSchema = new mongoose.Schema({
  accessToken: {
    type: String,
    required: "Access Token is Required",
  },
  refreshToken: {
    type: String,
    required: "Refresh Token is Required",
  },
});

const model = mongoose.model("Sketchfab", SketchfabSchema);
export default model;
