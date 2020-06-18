// Global

const HOME = "/";
const JOIN = "/join";
const LOGIN = "/login";
const LOGOUT = "/logout";
const SEARCH = "/search";

// Users

const USERS = "/users";
const USER_DETAIL = "/:id";
const EDIT_PROFILE = "/edit-profile";
const CHANGE_PASSWORD = "/change-password";
const WITHDRAW = "/withdraw";
const ME = "/me";

// Posts

const POSTS = "/posts";
const UPLOAD = "/upload";
const POST_DETAIL = "/:id";
const EDIT_POST = "/:id/edit";
const DELETE_POST = "/:id/delete";

// Github

const GITHUB = "/auth/github";
const GITHUB_CALLBACK = "/auth/github/callback";

// Google

const GOOGLE = "/auth/google";
const GOOGLE_CALLBACK = "/auth/google/callback";

// API
const API = "/api";
const DOWNLOAD_MODEL = "/:id/download";
const REQUEST_MODEL_GENERATION = "/generate";
const REQUEST_MODEL_DELETE = "/:id/delete";

const routes = {
  home: HOME,
  join: JOIN,
  login: LOGIN,
  logout: LOGOUT,
  search: SEARCH,
  users: USERS,
  userDetail: (id) => {
    if (id) {
      return `/users/${id}`;
    }
    return USER_DETAIL;
  },
  editProfile: EDIT_PROFILE,
  changePassword: CHANGE_PASSWORD,
  withdraw: WITHDRAW,
  posts: POSTS,
  upload: UPLOAD,
  postDetail: (id) => {
    if (id) {
      return `/posts/${id}`;
    }
    return POST_DETAIL;
  },
  editPost: (id) => {
    if (id) {
      return `/posts/${id}/edit`;
    }
    return EDIT_POST;
  },
  deletePost: (id) => {
    if (id) {
      return `/posts/${id}/delete`;
    }
    return DELETE_POST;
  },
  gitHub: GITHUB,
  githubCallback: GITHUB_CALLBACK,
  me: ME,
  google: GOOGLE,
  googleCallback: GOOGLE_CALLBACK,
  api: API,
  downloadModel: (id) => {
    if (id) {
      return `/api/${id}/download`;
    }
    return DOWNLOAD_MODEL;
  },
  requestModelGeneration: REQUEST_MODEL_GENERATION,
  requestModelDelete: (id) => {
    if (id) {
      return `/api/${id}/delete`;
    }
    return REQUEST_MODEL_DELETE;
  },
};

export default routes;
