/* eslint-disable no-await-in-loop */
/* eslint-disable camelcase */
import passport from "passport";
import routes from "../routes";
import User from "../models/User";
import Model from "../models/Model";
import Post from "../models/Post";
import Process from "../models/Process";

import { deleteSketchfabPost, emptyS3Directory } from "../api";

export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "Join" });
};

export const postJoin = async (req, res, next) => {
  // body-parser를 사용하지 않으면 req에 body 자체가 존재하지 않게 된다.
  const {
    body: { name, email, password, password2 },
  } = req;

  if (password !== password2) {
    // status 코드는 인터넷이 서로 상호작용할 때 사용되는 코드이다.
    // 400 = Bad Request (잘못된 요청)
    req.flash("error", "Passwords don't match");
    res.status(400);
    res.render("join", { pageTitle: "Join" });
  } else {
    try {
      const user = await User({
        name,
        email,
        avatarUrl: "defaultImages/default_user_img.png",
      });
      await User.register(user, password);
      // middelware는 현재 정보를 다음 middleware로 넘겨준다.
      next();
    } catch (error) {
      req.flash("error", error.message);
      res.redirect(routes.home);
    }
  }
};

export const getLogin = (req, res) => {
  res.render("login", { pageTitle: "Log In" });
};

// local strategy를 통해 사용자를 로그인시킨다.
// passport.authenticate()은 username(여기서는 email)과 password를 찾아보도록 설정되어 있다.
export const postLogin = passport.authenticate("local", {
  failureRedirect: routes.login,
  successRedirect: routes.home,
  failureFlash: "Can't log in. Check email and/or password",
});

export const githubLogin = passport.authenticate("github", {
  successFlash: "Welcome",
  failureFlash: "Can't log in.",
});

// cb는 passport로부터 제공되는 함수로, 호출 시 pasport에게 사용자가 성공적으로
// 인증이 되었는지, 혹은 로그인에 실패했음을 알려줄 수 있다.
export const githubLoginCallback = async (_, __, profile, cb) => {
  const {
    _json: { id, name, email, avatar_url: avatarUrl },
  } = profile;

  try {
    const user = await User.findOne({ email });
    if (user) {
      user.githubId = id;
      user.save();
      return cb(null, user);
    }
    const newUser = await User.create({
      email,
      name,
      githubId: id,
      avatarUrl,
    });
    return cb(null, newUser);
  } catch (error) {
    return cb(error);
  }
};

export const postGithubLogin = (req, res) => {
  res.redirect(routes.home);
};

export const googleLogin = passport.authenticate("google", {
  scope: ["profile", "email"],
  failureFlash: "Can't log in.",
});

export const googleLoginCallback = async (_, __, profile, cb) => {
  console.log(profile);
  const {
    _json: { sub: id, name, email, picture: avatarUrl },
  } = profile;

  try {
    const user = await User.findOne({ email });
    if (user) {
      user.googleId = id;
      user.save();
      return cb(null, user);
    }
    const newUser = await User.create({
      email,
      name,
      googleId: id,
      avatarUrl,
    });
    return cb(null, newUser);
  } catch (error) {
    return cb(error);
  }
};

export const postGoogleLogin = (req, res) => {
  res.redirect(routes.home);
};

export const logout = (req, res) => {
  req.flash("info", "Logged out, see you later");
  req.logout();
  res.redirect(routes.home);
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate("posts")
      .populate("models");
    const process = await Process.find({ userId: req.user.id });
    res.render("userDetail", { pageTitle: "User Detail", user, process });
  } catch (error) {
    res.redirect(routes.home);
  }
};

export const userDetail = async (req, res) => {
  const {
    params: { id },
  } = req;

  try {
    const user = await User.findById(id)
      .populate("posts")
      .populate("models");
    const process = await Process.find({ userId: id });
    res.render("userDetail", { pageTitle: "User Detail", user, process });
  } catch (error) {
    req.flash("error", "User not found");
    res.redirect(routes.home);
  }
};

export const getEditProfile = (req, res) => {
  res.render("editProfile", { pageTitle: "Edit Profile" });
};

export const postEditProfile = async (req, res) => {
  const {
    body: { name, email },
    file,
  } = req;

  try {
    await User.findByIdAndUpdate(req.user.id, {
      name,
      email,
      avatarUrl: file ? file.location : req.user.avatarUrl,
    });
    req.flash("success", "Profile updated");
    res.redirect(routes.me);
  } catch (error) {
    req.flash("error", "Can't update profile");
    res.redirect(`/users/${routes.editProfile}`);
  }
};

export const getChangePassword = (req, res) =>
  res.render("changePassword", { pageTitle: "Change Password" });

export const postChangePassword = async (req, res) => {
  const {
    body: { oldPassword, newPassword, newPassword1 },
  } = req;

  try {
    if (newPassword !== newPassword1) {
      req.flash("error", "Passwords don't math");
      res.status(400);
      res.redirect(`/users/${routes.changePassword}`);
      return;
    }
    // 패스워드는 절대로 텍스트 그대로 저장되지 않고, 반드시 암호화되어 저장된다.
    // 따라서 changePassword의 인자로 oldPassword를 줄 때, oldPassword가 암호화된 결과와
    // user에 저장되어 있는 진짜 패스워드가 암호화된 결과가 같은지를 확인하고, 같다면 패스워드 변경을 처리한다.
    await req.user.changePassword(oldPassword, newPassword);
    res.redirect(routes.me);
  } catch (error) {
    req.flash("error", "Can't change password");
    res.status(400);
    res.redirect(`/users/${routes.changePassword}`);
  }
};

export const withdrawUser = async (req, res) => {
  const user = await User.findById(req.user.id)
    .populate("posts")
    .populate("models");
  const { posts } = user;
  const { models } = user;

  for (let i = 0; i < posts.length; i += 1) {
    await deleteSketchfabPost(posts[i].sketchfabModelLocation);
    await Post.findByIdAndDelete(posts[i].id);
  }

  for (let i = 0; i < models.length; i += 1) {
    await Model.findByIdAndDelete(models[i].id);
  }

  await User.findByIdAndDelete(user.id);

  await emptyS3Directory("fittinghome", `model/${user.email}/`);
  res.redirect(routes.home);
};
