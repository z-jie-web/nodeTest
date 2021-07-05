const koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const mongoose = require("mongoose");
const passport = require("koa-passport");
const db = require("./config/keys").mongoURL;

// 实例化
const app = new koa();
const router = new Router();
app.use(bodyParser());

// 路由
router.get("/", async (ctx) => {
  ctx.body = { msg: "Hello Koa Interfaces!" };
});

// 连接
mongoose
  .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("已连接1111");
  })
  .catch((err) => {
    console.log(err, "sssssss");
  });

// 引入users,js
const users = require("./routes/api/user");
const profile = require("./routes/api/profile");

// 配置路由地址
router.use("/api/users", users);
router.use("/api/profile", profile);

// 解析token
app.use(passport.initialize());
app.use(passport.session());

/// 回调到config  文件中  passport.js
require('./config/passport')(passport);

// 配置路由
app.use(router.routes()).use(router.allowedMethods());

const port = process.env.PORT || 10086;

app.listen(port, () => {
  console.log(`server started on ${port}`);
});
