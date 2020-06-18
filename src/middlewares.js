import aws from "aws-sdk";
import multer from "multer";
import fs from "fs";

import routes from "./routes";

export const s3 = new aws.S3({
  secretAccessKey: process.env.AWS_PRIVATE_KEY,
  accessKeyId: process.env.AWS_KEY,
  region: "ap-northeast-2",
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const modelLocation = `src/temp/${req.user.email}`;
    if (!fs.existsSync(modelLocation)) {
      fs.mkdirSync(modelLocation);
    }
    cb(null, `src/temp/${req.user.email}`);
  },
  filename: (req, file, cb) => cb(null, file.originalname),
});

const multerModel = multer({ storage });

export const localsMiddleware = async (req, res, next) => {
  res.locals.siteName = "FittingHome";
  res.locals.routes = routes;
  // passport에서 현재 로그인 된 유저 오브젝트를 req.user에 넣어준다.
  // 이를 locals에 추가함으로써 컨트롤러와 템플릿 모두에서 사용할 수 있도록 한다.
  res.locals.loggedUser = req.user || null;
  next();
};

export const onlyPublic = (req, res, next) => {
  if (req.user) {
    res.redirect(routes.home);
  } else {
    next();
  }
};

export const onlyPrivate = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect(routes.home);
  }
};

export const uploadModel = multerModel.single("modelFile");
