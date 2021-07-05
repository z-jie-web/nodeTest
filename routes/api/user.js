const Router = require("koa-router");
const User = require("../../models/User");
const gravatar = require("gravatar");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("koa-passport");
const tools = require("../../config/tools");
const { secretOrKey } = require("../../config/keys");

const router = new Router();

// 引入验证

const validateRegisterInput = require("../../validation/register");
const validateLoginInput = require("../../validation/login");

const sqlName = "SELECT name from user";

// const mysql = require("mysql");
// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: "root",
//   database: "my_blog",
// });

// connection.query(sqlName, function (error, results, fields) {
//   if (error) throw error;
//   // const findResult=await results

//   console.log('The solution is:7 ', results);
// });
/**
 * @router get  api/users/test
 * @desc 测试接口地址
 * @access 接口是公开的
 */
router.get("/test", async (ctx) => {
  ctx.status = 200;
  ctx.body = { msg: "users works" };
});

/**
 * @router post  api/users/register
 * @desc 注册接口地址
 * @access 接口是公开的
 */

router.post("/register", async (ctx) => {
  console.log(ctx.request.body, "sssssssss");

  const { errors, isValid } = validateRegisterInput(ctx.request.body);

  // 判断是否验证通过
  if (!isValid) {
    ctx.status = 400;
    ctx.body = errors;
    return;
  }

  const { email, name, password } = ctx.request.body;
  // 存储到数据库
  const findResult = await User.find({
    email,
  });
  console.log(findResult, "findResult");
  if (findResult.length > 0) {
    ctx.status = 500;
    ctx.body = { email: "邮箱已被占用" };
  } else {
    const avatar = gravatar.url(email, {
      s: "200",
      r: "pg",
      d: "mm", //默认的头像
    });
    const newUser = new User({
      name,
      email,
      avatar,
      password: tools.enbcrypt(password),
    });

    // 密码加密

    // 存储到数据库
    await newUser
      .save()
      .then((user) => {
        ctx.body = user;
      })
      .catch((err) => {
        console.log(err);
      });

    // 返回json数据
    ctx.body = newUser;
  }
});

/**
 * @router post  api/users/login
 * @desc 登录接口地址   返回token
 * @access 接口是公开的
 */

router.post("/login", async (ctx) => {
  const { email, password } = ctx.request.body;

  const { errors, isValid } = validateLoginInput(ctx.request.body);

  // 判断是否验证通过
  if (!isValid) {
    ctx.status = 400;
    ctx.body = errors;
    return;
  }

  const findResult = await User.find({ email });
  const user = findResult[0];
  if (findResult.length === 0) {
    ctx.status = 404;
    ctx.body = { email: "用户不存在" };
  } else {
    const results = await bcrypt.compareSync(password, user.password);
    if (results) {
      // 返回token
      const payload = { id: user.id, name: user.name, avatar: user.avatar };
      // expiresIn 过期时间 （s）
      const token = jwt.sign(payload, secretOrKey, { expiresIn: 3600 });
      ctx.status = 200;
      ctx.body = { success: true, token: `Bearer ${token}` };
    } else {
      ctx.status = 400;
      ctx.body = { password: "密码错误" };
    }
  }
});

/**
 * @router post  api/users/current
 * @desc 用户信息接口地址   返回用户信息
 * @access 接口是私有的
 */

router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    const { email, id, name, avatar } = ctx.state.user;
    ctx.body = { email, id, name, avatar };
  }
);

module.exports = router.routes();
