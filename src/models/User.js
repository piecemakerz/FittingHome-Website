import mongoose from "mongoose";
import passportLocalMongoose from "passport-local-mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  avatarUrl: String,
  googleId: Number,
  githubId: Number,
  deviceToken: String,
  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "Post" }],
  models: [{ type: mongoose.Schema.Types.ObjectId, ref: "Model" }],
});

UserSchema.plugin(passportLocalMongoose, { usernameField: "email" });
const model = mongoose.model("User", UserSchema);
export default model;
