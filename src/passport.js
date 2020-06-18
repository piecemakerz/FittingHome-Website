import passport from "passport";
import GithubStrategy from "passport-github";
import GoogleStrategy from "passport-google-oauth20";
import User from "./models/User";
import {
  githubLoginCallback,
  googleLoginCallback,
} from "./controllers/userController";
import routes from "./routes";

passport.use(User.createStrategy());

passport.use(
  new GithubStrategy(
    {
      clientID: process.env.GH_ID,
      clientSecret: process.env.GH_SECRET,
      callbackURL: process.env.PRODUCTION
        ? `${process.env.PRODUCTION_URL}${routes.githubCallback}`
        : `${process.env.LOCAL_URL}${routes.githubCallback}`,
    },
    githubLoginCallback
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GG_ID,
      clientSecret: process.env.GG_SECRET,
      callbackURL: process.env.PRODUCTION
        ? `${process.env.PRODUCTION_URL}${routes.googleCallback}`
        : `${process.env.LOCAL_URL}${routes.googleCallback}`,
    },
    googleLoginCallback
  )
);

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
