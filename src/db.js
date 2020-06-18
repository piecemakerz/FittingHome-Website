import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useFindAndModify: false,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

const handleOpen = () => console.log("Connected to DB");
const handleError = (error) => console.log(`Error on DB: ${error}`);

// 처음 한번 실행하며, connection을 열어주고 성공할 시 handleOpen을 실행해준다.
db.once("open", handleOpen);
// 에러가 발생할 때 마다 handleError를 실행해준다.
db.on("error", handleError);
