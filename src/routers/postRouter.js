import express from "express";
import routes from "../routes";
import {
  postDetail,
  deletePost,
  getUpload,
  postUpload,
  getEditPost,
  postEditPost,
} from "../controllers/postController";
import { onlyPrivate, uploadModel } from "../middlewares";
// Posts

const postRouter = express.Router();

postRouter.get(routes.upload, onlyPrivate, getUpload);
postRouter.post(routes.upload, onlyPrivate, uploadModel, postUpload);

postRouter.get(routes.postDetail(), postDetail);

postRouter.get(routes.editPost(), onlyPrivate, getEditPost);
postRouter.post(routes.editPost(), onlyPrivate, postEditPost);

postRouter.get(routes.deletePost(), onlyPrivate, deletePost);

export default postRouter;
