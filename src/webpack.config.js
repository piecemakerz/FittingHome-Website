// webpack은 module bundler로, 파일들을 완전히 호환되는
// static 파일들로 변환해준다.
// npm install webpack webpack-cli
// webpack은 실행되는 즉시 webpack.config.js라는 파일을 찾은 후,
// esported configuration object를 찾는다.

// config 파일에서는 server 코드와 연관시키면 안되며 100% client 코드로 작성되어야 한다.
// 따라서, babel-node가 작동하지 않으므로 이전 버전의 자바스크립트로 작성해야 한다.

// path는 node.js의 기본 패키지로,
// node.js에서 파일과 디렉토리 경로를 absolute(전체 경로)로 만들어주는 패키지이다.
const path = require("path");
const autoprefixer = require("autoprefixer");
// npm install extract-text-webpack-plugin@next -> package의 버전을 명시하여 설치
const ExtractCSS = require("extract-text-webpack-plugin");

// package.json에서 set WEBPACK_ENV=development를 통해 수동으로 정의해준 global 변수
const MODE = process.env.WEBPACK_ENV;
const ENTRY_FILE = path.resolve(__dirname, "assets", "js", "main.js");
const OUTPUT_DIR = path.join(__dirname, "static");

const config = {
  // entry: 파일들이 어디와서 왔는가
  entry: ["@babel/polyfill", ENTRY_FILE],
  mode: MODE,
  // module을 찾을 때 마다 아래 rule들을 따르라는 명시
  module: {
    // webpack이 파일 형식들을 이해하기 위해서는 변환 방식을 loader를 통해 정의해야 한다.
    // loader는 webpack에게 파일을 처리하는 방법을 알려주는 역할을 한다.
    rules: [
      {
        test: /\.(js)$/,
        use: [
          {
            loader: "babel-loader",
          },
        ],
      },
      {
        // 모든 scss 파일 탐색
        test: /\.(scss)$/,
        // css의 텍스트를 어떻게 추출할지 명시
        // webpack에서는 loader를 사용할 때 끝에서부터 처음으로 거꾸로 진행한다.
        // npm install css-loader postcss-loader sass-loader
        use: ExtractCSS.extract([
          // 순수한 css를 로드함
          {
            loader: "css-loader",
          },
          // css를 plugin을 통해 변환해줌
          // autoprefixer는 다양한 브라우저에서 코드가 호환되도록 코드를 변환해준다.
          // npm install autoprefixer
          {
            loader: "postcss-loader",
            options: {
              plugins() {
                return [autoprefixer({ browsers: "cover 99.5%" })];
              },
            },
          },
          // scss를 받아 일반 css로 변환해줌
          {
            loader: "sass-loader",
          },
        ]),
      },
    ],
  },
  // output: 변환 결과를 어디에 저장할 것인가
  output: {
    path: OUTPUT_DIR,
    filename: "[name].js",
  },
  plugins: [new ExtractCSS("styles.css")],
};

// export default의 이전버전
module.exports = config;
