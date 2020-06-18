/* eslint-disable camelcase */
/* eslint-disable import/first */
import dotenv from "dotenv";
import "./db";

import app from "./app";
import { initAccessToken } from "./api";

// app.js에서 설정 완료된 app 오브젝트를 가져온다.
// dotenv는 .env 파일 안에 있는 정보를 불러와
// 모든 variable들을 process.env에 key로 저장한다.
dotenv.config();

import "./models/Model";
import "./models/User";
import "./models/Post";
import "./models/Sketchfab";
import "./models/Process";

const PORT = process.env.PORT || 5000;
const CREDENTIALS = Buffer.from(
  `${process.env.SKETCHFAB_CLIENT_ID}:${process.env.SKETCHFAB_CLIENT_SECRET}`
).toString("base64");

const handleListening = () =>
  console.log(`Listening on: http://localhost:${PORT}`);

initAccessToken(CREDENTIALS);

app.listen(PORT, handleListening);
