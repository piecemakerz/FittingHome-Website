/* eslint-disable import/prefer-default-export */
import fetch from "node-fetch";
import dotenv from "dotenv";
import formidable from "formidable";
import FormData from "form-data";
import fs from "fs";
import { getModelDownloadLink } from "../api";
import Post from "../models/Post";
import Model from "../models/Model";
import { s3 } from "../middlewares";
dotenv.config();

export const postDownloadModel = async (req, res) => {
  const {
    body: { type, modelId },
  } = req;
  const posts = await Post.find({ sketchfabId: modelId }).populate("model");
  const post = posts[0];

  if (type === "original") {
    const { modelLocation } = post.model;
    res.json({ modelLocation });
  } else if (type === "gltf" || type === "usdz") {
    const link = await getModelDownloadLink(post.sketchfabModelLocation);
    if (type === "gltf") {
      if (link === undefined || link.gltf === undefined) {
        res.json({ error: "GLTF Model Not Available Yet" });
      } else {
        res.json({ modelLocation: link.gltf.url });
      }
    } else {
      if (link === undefined || link.usdz === undefined) {
        res.json({ error: "USDZ Model Not Available Yet" });
      }
      res.json({ modelLocation: link.usdz.url });
    }
  }
};

export const getRequestModelGeneration = (req, res) => {
  res.render("requestModelGeneration", { pageTitle: "Generate Model" });
};

export const postRequestModelGeneration = async (req, res) => {
  const form = formidable({ multiples: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.log("error occurred in formidable");
      res.status(500).send(err.message);
    } else {
      try {
        const file = fs.readFileSync(files.file.path);
        const formdata = new FormData();
        formdata.append("file", file, files.file.name);
        formdata.append("userid", fields.userid);
        const response = await fetch(
          "https://fitting-home.fun25.co.kr/upload",
          {
            method: "POST",
            body: formdata,
          }
        );
        res.send(response);
      } catch (error) {
        console.log("error occured in try", error);
        res.status(500).send(error.message);
      }
    }
  });
};

export const getRequestModelDelete = async (req, res) => {
  const {
    params: { id },
  } = req;

  try {
    const model = await Model.findById(id);
    const post = await Post.find({ model: id });
    const s3Param = {
      Bucket: "fittinghome",
      Key: `model/${req.user.email}/${model.modelName}`,
    };

    if (post.length === 0) {
      s3.deleteObject(s3Param, async (err, data) => {
        if (err) {
          console.log(err);
          throw Error("S3 Model Delete Failed");
        }
      });
      await Model.findOneAndRemove({ _id: model._id });
    }

    const modelIdx = req.user.models.indexOf(id);
    if (modelIdx > -1) {
      await req.user.models.splice(modelIdx, 1);
      req.user.save();
    }
    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(400);
  }
};
