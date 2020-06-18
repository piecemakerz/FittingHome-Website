import "core-js";
import express from "express";
import morgan from "morgan";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import passport from "passport";

import mongoose from "mongoose";
import session from "express-session";
import MongoStore from "connect-mongo";
import path from "path";
import flash from "express-flash";
import cors from "cors";

import { localsMiddleware } from "./middlewares";
import routes from "./routes";

import globalRouter from "./routers/globalRouter";
import userRouter from "./routers/userRouter";
import postRouter from "./routers/postRouter";
import apiRouter from "./routers/apiRouter";

import "./passport";

const app = express();

const CookieStore = MongoStore(session);

app.use(helmet());
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

app.use("/static", express.static(path.join(__dirname, "static")));
app.use("/temp", express.static(path.join(__dirname, "temp")));
app.use(
  "/defaultImages",
  express.static(path.join(__dirname, "defaultImages"))
);

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cors());

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: true,
    saveUninitialized: false,
    store: new CookieStore({ mongooseConnection: mongoose.connection }),
    cookie: {
      expires: new Date(Date.now() + 3600000 * 24),
    },
  })
);

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use(localsMiddleware);

app.use(routes.home, globalRouter);
app.use(routes.users, userRouter);
app.use(routes.posts, postRouter);
app.use(routes.api, apiRouter);

export default app;
