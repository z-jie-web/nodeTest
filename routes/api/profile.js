const Router = require("koa-router");
const Profile = require("../../models/Profile");
const gravatar = require("gravatar");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("koa-passport");
const tools = require("../../config/tools");
const { secretOrKey } = require("../../config/keys");

const router = new Router();

/**
 * @router get  api/profile/test
 * @desc 测试接口地址
 * @access 接口是公开的
 */
router.get("/test", async (ctx) => {
  ctx.status = 200;
  ctx.body = { msg: "profile works" };
});

/**
 * @router get  api/profile
 * @desc 个人信息接口地址
 * @access 接口是私有的
 */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    const { id } = ctx.state.user;
    console.log(ctx.state.user);
    // ProfileProfile

    const profile = await Profile.find({ user: id }).populate("user", [
      "name",
      "avatar",
    ]);

    console.log(profile, "profileprofile");

    if (profile.length > 0) {
      ctx.status = 200;
      ctx.body = profile;
    } else {
      ctx.status = 404;
      ctx.body = { noprofile: "该用户没有任何的相关信息" };
    }
    return;
  }
);

module.exports = router.routes();


/**
 * https://www.bilibili.com/video/BV15b411z7qj?p=14&spm_id_from=pageDriver
 * p13 已看完
 */

