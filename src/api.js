/* eslint-disable camelcase */
/* eslint-disable import/no-mutable-exports */
/* eslint-disable import/prefer-default-export */
import axios from "axios";
import fetch from "node-fetch";
import Sketchfab from "./models/Sketchfab";
import { s3 } from "./middlewares";

let accessToken;

export const getAccessToken = () => {
  return accessToken;
};

export const initAccessToken = async (CREDENTIALS) => {
  try {
    const sketchfabInfo = await Sketchfab.find({});
    if (sketchfabInfo.length) {
      const { refreshToken: prevRefreshToken } = sketchfabInfo[0];

      const response = await axios.post(
        "https://sketchfab.com/oauth2/token/",
        `grant_type=refresh_token&client_id=${process.env.SKETCHFAB_CLIENT_ID}&client_secret=${process.env.SKETCHFAB_CLIENT_SECRET}&refresh_token=${prevRefreshToken}`
        // {
        //   headers: {
        //     Authorization: `Basic ${CREDENTIALS}`,
        //   },
        // }
      );

      const {
        data: { access_token, refresh_token: refreshToken },
      } = response;

      accessToken = access_token;
      await Sketchfab.deleteMany({});
      await Sketchfab.create({
        accessToken,
        refreshToken,
      });
    } else {
      const response = await axios.post(
        "https://sketchfab.com/oauth2/token/",
        `grant_type=password&username=${process.env.SKETCHFAB_USERNAME}&password=${process.env.SKETCHFAB_PASSWORD}`,
        {
          headers: {
            Authorization: `Basic ${CREDENTIALS}`,
          },
        }
      );

      const {
        data: { access_token, refresh_token: refreshToken },
      } = response;

      accessToken = access_token;

      await Sketchfab.create({
        accessToken,
        refreshToken,
      });
    }
  } catch (error) {
    console.log("error occurred while getting access token");
  }
};

export const postModelData = async (uri, data) => {
  try {
    const response = await fetch(uri, {
      method: "POST",
      mode: "cors",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: data,
    });
    const responseJSON = await response.json();
    return { response, responseJSON };
  } catch (error) {
    console.log(error);
    throw new Error("Sketchfab Upload Failed");
  }
};

export const getModelData = async (uri) => {
  try {
    const response = await fetch(uri, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const responseJSON = await response.json();
    return { response, responseJSON };
  } catch (error) {
    console.log(error);
    throw new Error("Error while getting model information");
  }
};

export const getModelDownloadLink = async (uri) => {
  try {
    const response = await fetch(`${uri}/download`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      mode: "cors",
    });
    const responseJSON = await response.json();
    return responseJSON;
  } catch (error) {
    console.log(error);
    throw new Error("Error while getting model download url");
  }
};

export const deleteSketchfabPost = async (uri) => {
  try {
    const response = await fetch(uri, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      mode: "cors",
    });
    return response;
  } catch (error) {
    console.log(error);
    throw new Error("Error while deleting post");
  }
};

export const editSketchfabPost = async (uri, title, description) => {
  try {
    const response = await fetch(uri, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      mode: "cors",
      data: { name: title, description },
    });
    return response;
  } catch (error) {
    console.log(error);
    throw new Error("Error while deleting post");
  }
};

export const emptyS3Directory = async (bucket, dir) => {
  const listParams = {
    Bucket: bucket,
    Prefix: dir,
  };

  const listedObjects = await s3.listObjectsV2(listParams).promise();

  if (listedObjects.Contents.length === 0) return;

  const deleteParams = {
    Bucket: bucket,
    Delete: { Objects: [] },
  };

  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key });
  });

  await s3.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
};
