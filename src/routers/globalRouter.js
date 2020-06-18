import express from "express";
import passport from "passport";
import routes from "../routes";
import { home, search } from "../controllers/postController";
import {
  logout,
  postJoin,
  getJoin,
  getLogin,
  postLogin,
  githubLogin,
  postGithubLogin,
  getMe,
  googleLogin,
  postGoogleLogin,
  withdrawUser,
} from "../controllers/userController";
import { onlyPublic, onlyPrivate } from "../middlewares";

const globalRouter = express.Router();

globalRouter.get(routes.home, home);
globalRouter.get(routes.search, search);

globalRouter.get(routes.join, onlyPublic, getJoin);
globalRouter.post(routes.join, onlyPublic, postJoin, postLogin);

globalRouter.get(routes.login, onlyPublic, getLogin);
globalRouter.post(routes.login, onlyPublic, postLogin);

globalRouter.get(routes.logout, onlyPrivate, logout);

globalRouter.get(routes.gitHub, githubLogin);
globalRouter.get(
  routes.githubCallback,
  passport.authenticate("github", {
    failureRedirect: routes.login,
  }),
  postGithubLogin
);

globalRouter.get(routes.me, getMe);

globalRouter.get(routes.google, googleLogin);
globalRouter.get(
  routes.googleCallback,
  passport.authenticate("google", {
    failureRedirect: routes.login,
  }),
  postGoogleLogin
);

globalRouter.get(routes.withdraw, onlyPrivate, withdrawUser);

export default globalRouter;
