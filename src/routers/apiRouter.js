import express from "express";
import routes from "../routes";
import {
  postDownloadModel,
  getRequestModelGeneration,
  getRequestModelDelete,
  postRequestModelGeneration,
} from "../controllers/apiController";

const apiRouter = express.Router();

apiRouter.post(routes.downloadModel(), postDownloadModel);

apiRouter.get(routes.requestModelGeneration, getRequestModelGeneration);
apiRouter.post(routes.requestModelGeneration, postRequestModelGeneration);

apiRouter.get(routes.requestModelDelete(), getRequestModelDelete);

export default apiRouter;
