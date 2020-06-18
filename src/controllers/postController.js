import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import Path from "path";
import rimraf from "rimraf";

import dotenv from "dotenv";
import FormData from "form-data";

import { s3 } from "../middlewares";
import routes from "../routes";
import Post from "../models/Post";
import Model from "../models/Model";
import User from "../models/User";
import {
  getAccessToken,
  getModelData,
  postModelData,
  deleteSketchfabPost,
  editSketchfabPost,
} from "../api";

dotenv.config();

export const home = async (req, res) => {
  try {
    const posts = await Post.find({}).sort({ _id: -1 });
    const getModelDataPromises = [];
    const postId = [];

    posts.forEach(async (post) => {
      if (!post.thumbnail) {
        await Post.findOneAndUpdate(
          { _id: post._id },
          { thumbnail: process.env.DEFAULT_MODEL_THUMBNAIL }
        );
      } else if (
        post.thumbnail === process.env.DEFAULT_MODEL_THUMBNAIL ||
        post.thumbnail === process.env.DEFAULT_MODEL_THUMBNAIL2
      ) {
        getModelDataPromises.push(getModelData(post.sketchfabModelLocation));
        postId.push(post._id);
      }
    });

    if (getModelDataPromises.length) {
      const responses = await Promise.all(getModelDataPromises);
      const updateThumbnailPromises = [];
      responses.forEach((response, idx) => {
        const { responseJSON } = response;
        const {
          status: { processing },
          thumbnails: { images },
        } = responseJSON;

        if (processing === "SUCCEEDED") {
          updateThumbnailPromises.push(
            Post.findOneAndUpdate(
              { _id: postId[idx] },
              { thumbnail: images[2].url }
            )
          );
        }
      });

      if (updateThumbnailPromises.length) {
        await Promise.all(updateThumbnailPromises);
      }
    }

    res.render("home", { pageTitle: "Home", posts });
  } catch (error) {
    res.render("home", { pageTitle: "Home", posts: [] });
  }
};

export const search = async (req, res) => {
  // 서버에 form을 통해 GET method으로 전송한 정보는 url에 '?term=android&term2=apple'과 같은 형태로
  // 나타나게 되는데, 이 정보를 req.query를 통해 얻어올 수 있다.
  const {
    query: { term: searchingBy },
  } = req;

  let posts = [];
  try {
    // 정규 표현식(regular expression)을 사용한 검색
    // i 옵션은 대소문자 구분을 하지 않는다는 의미이다. (insensitive)
    posts = await Post.find({
      title: { $regex: searchingBy, $options: "i" },
    });
  } catch (error) {
    console.log(error);
  }
  res.render("search", { pageTitle: "Search", searchingBy, posts });
};

export const getUpload = (req, res) =>
  res.render("upload", { pageTitle: "Upload" });

export const postUpload = async (req, res) => {
  const {
    body: { title, description },
    file,
  } = req;

  const modelName = file.originalname;
  const modelPath = Path.join(file.destination, modelName);
  const modelEndpoint = `${process.env.SKETCHFAB_API_URL}/models`;
  const sendFormData = new FormData();
  const modelNameSplit = modelName.split(".");
  const s3ModelName = `${modelNameSplit[0]}__${uuidv4()}.${modelNameSplit[1]}`;

  const zipFileContent = fs.readFileSync(modelPath);
  const s3Param = {
    Bucket: `fittinghome/model/${req.user.email}`,
    ACL: "public-read",
    Key: s3ModelName,
    Body: zipFileContent,
  };

  sendFormData.append("name", title);
  sendFormData.append("description", description);
  sendFormData.append("tags", "openMVG openMVS");
  sendFormData.append("categories", "furniture-home");
  sendFormData.append("modelFile", zipFileContent, file.originalname);
  sendFormData.append("isPublished", "true");
  sendFormData.append("isInspectable", "true");
  sendFormData.append("license", "CC Attribution");

  try {
    const {
      responseJSON: { uid, uri },
    } = await postModelData(modelEndpoint, sendFormData);

    const {
      responseJSON: {
        status: { processing },
      },
    } = await getModelData(uri);

    s3.upload(s3Param, async (err, data) => {
      if (err) {
        throw new Error("S3 Upload Failed");
      }
      const newModel = await Model.create({
        user: req.user.id,
        modelName: s3ModelName,
        modelLocation: data.Location,
      });

      const newPost = await Post.create({
        title,
        description,
        user: req.user.id,
        model: newModel,
        sketchfabId: uid,
        sketchfabModelLocation: uri,
        status: processing,
        thumbnail: process.env.DEFAULT_MODEL_THUMBNAIL,
      });

      req.user.posts.push(newPost.id);
      req.user.models.push(newModel.id);
      req.user.save();

      rimraf.sync(file.destination);
      res.redirect(routes.postDetail(newPost.id));
    });
  } catch (error) {
    console.log(error);
    res.redirect(routes.home);
  }
};

export const postDetail = async (req, res) => {
  const {
    params: { id },
  } = req;

  try {
    const post = await Post.findById(id)
      .populate("model")
      .populate("user");

    const accessToken = getAccessToken();

    const { responseJSON } = await getModelData(post.sketchfabModelLocation);
    const {
      status: { processing },
    } = responseJSON;

    if (processing === "FAILED") {
      await Model.findOneAndRemove({ _id: post.model._id });
      await Post.findOneAndRemove({ _id: id });
      const postIdx = req.user.posts.indexOf(id);
      if (postIdx > -1) {
        req.user.posts.splice(postIdx, 1);
        req.user.save();
      }
      const modelIdx = req.user.models.indexOf(post.model._id);
      if (modelIdx > -1) {
        req.user.models.splice(modelIdx, 1);
        req.user.save();
      }
      res.render("error", { pageTitle: "Error" });
    } else {
      res.render("postDetail", {
        pageTitle: post.title,
        post,
        accessToken,
        processing,
      });
    }
  } catch (error) {
    console.log(error);
    res.redirect(routes.home);
  }
};

export const getEditPost = async (req, res) => {
  const {
    params: { id },
  } = req;

  try {
    const post = await Post.findById(id);
    if (String(post.user) !== req.user.id) {
      throw Error();
    } else {
      res.render("editPost", { pageTitle: `Edit ${post.title}`, post });
    }
  } catch (error) {
    res.redirect(routes.home);
  }
};

export const postEditPost = async (req, res) => {
  const {
    params: { id },
    body: { title, description },
  } = req;

  try {
    const post = await Post.findById(id);
    await post.updateOne({ title, description, updateDate: Date.now });
    await editSketchfabPost(
      post.sketchfabModelLocation,
      `${title}__${uuidv4()}`,
      description
    );
    res.redirect(routes.postDetail(id));
  } catch (error) {
    res.redirect(routes.home);
  }
};

export const deletePost = async (req, res) => {
  const {
    params: { id },
  } = req;

  try {
    const post = await Post.findById(id).populate("model");
    const s3Param = {
      Bucket: "fittinghome",
      Key: `model/${req.user.email}/${post.model.modelName}`,
    };
    if (String(post.user) !== req.user.id) {
      throw Error("User Missmatch");
    } else {
      s3.deleteObject(s3Param, async (err, data) => {
        if (err) {
          console.log(err);
          throw Error("S3 Delete Failed");
        }
        console.log(data);
        await deleteSketchfabPost(post.sketchfabModelLocation);
        await Model.findOneAndRemove({ _id: post.model._id });
        await Post.findOneAndRemove({ _id: id });
        const postIdx = req.user.posts.indexOf(id);
        if (postIdx > -1) {
          req.user.posts.splice(postIdx, 1);
          req.user.save();
        }
        const modelIdx = req.user.models.indexOf(post.model._id);
        if (modelIdx > -1) {
          req.user.models.splice(modelIdx, 1);
          req.user.save();
        }
      });
    }
  } catch (error) {
    console.log(error);
  }

  res.redirect(routes.home);
};
