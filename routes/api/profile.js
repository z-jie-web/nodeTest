const Router = require("koa-router");
const Profile = require("../../models/Profile");
const gravatar = require("gravatar");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const passport = require("koa-passport");
const tools = require("../../config/tools");
const { secretOrKey } = require("../../config/keys");
const User = require("../../models/User");

const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");

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

    const profile = await Profile.find({ user: id }).populate("users", [
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

/**
 * @router post  api/profile
 * @desc t添加和编辑个人信息接口地址
 * @access 接口是私有的
 */

router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    const { errors, isValid } = validateProfileInput(ctx.request.body);

    // 判断是否验证通过
    if (!isValid) {
      ctx.status = 400;
      ctx.body = errors;
      return;
    }

    const profileFields = {};
    profileFields.user = ctx.state.user.id;
    const {
      handle,
      company,
      website,
      location,
      status,
      skills,
      bio,
      githunusername,
      wechat,
      QQ,
      tengxunkt,
      wangyikt,
    } = ctx.request.body;
    if (handle) {
      profileFields.handle = handle;
    }
    if (company) {
      profileFields.company = company;
    }
    if (website) {
      profileFields.website = website;
    }
    if (location) {
      profileFields.location = location;
    }
    if (status) {
      profileFields.status = status;
    }

    //  数据转换
    if (typeof skills !== undefined) {
      profileFields.skills = skills.split(",");
    }

    if (bio) {
      profileFields.bio = bio;
    }
    if (githunusername) {
      profileFields.handle = githunusername;
    }

    profileFields.social = {};

    if (wechat) {
      profileFields.social.wechat = wechat;
    }
    if (QQ) {
      profileFields.social.QQ = QQ;
    }
    if (tengxunkt) {
      profileFields.social.tengxunkt = tengxunkt;
    }
    if (wangyikt) {
      profileFields.social.wangyikt = wangyikt;
    }

    // 查询数据库

    const profile = await Profile.find({ user: ctx.state.user.id });
    console.log(profile, "profileprofile");
    if (profile.length > 0) {
      // 编辑更新
      const profileUpdate = await Profile.findOneAndUpdate(
        { user: ctx.state.user.id },
        { $set: profileFields },
        { new: true }
      );
      console.log(444);
      ctx.body = profileUpdate;
    } else {
      await new Profile(profileFields).save().then((profile) => {
        ctx.status = 200;
        ctx.body = profile;
      });
    }
  }
);

/**
 * @router get  api/profile/handle?handle=test
 * @desc 通过handle获取个人信息
 * @access 接口是公开的
 */
router.get("/handle", async (ctx) => {
  const errors = {};
  const { handle } = ctx.query;
  const profile = await Profile.find({ handle }).populate("users", [
    "name",
    "avatar",
  ]);
  console.log(profile, "profileprofile");

  if (profile.length > 0) {
    ctx.status = 200;
    ctx.body = profile;
  } else {
    errors.noprofile = "未找到该用户信息";
    ctx.status = 404;
    ctx.body = errors;
  }
});

/**
 * @router get  api/profile/all
 * @desc 获取所有人信息接口
 * @access 接口是公开的
 */
router.get("/all", async (ctx) => {
  const errors = {};
  const { handle } = ctx.query;
  const profile = await Profile.find({}).populate("users", ["name", "avatar"]);
  console.log(profile, "profileprofile");

  if (profile.length > 0) {
    ctx.status = 200;
    ctx.body = profile;
  } else {
    errors.noprofile = "没有任何用户信息";
    ctx.status = 404;
    ctx.body = errors;
  }
});

/**
 * @router get  api/profile/experience
 * @desc 工作经验接口地址
 * @access 接口是私有的
 */
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    const { errors, isValid } = validateExperienceInput(ctx.request.body);

    // 判断是否验证通过
    if (!isValid) {
      ctx.status = 400;
      ctx.body = errors;
      return;
    }

    const profileFields = {};
    profileFields.experience = [];
    const { title, current, company, location, from, to, description } =
      ctx.request.body;
    const profile = await Profile.find({ user: ctx.state.user.id });
    if (profile.length > 0) {
      const newExp = {
        title,
        current,
        company,
        location,
        from,
        to,
        description,
      };
      profileFields.experience.unshift(newExp);
      // console.log(profileFields, "profileFieldsprofileFields");
      const profileUpdate = await Profile.updateOne(
        { user: ctx.state.user.id },
        { $push: { experience: profileFields.experience } },
        { $sort: 1 }
      );
      if (profileUpdate.ok === 1) {
        const profile = await Profile.find({
          user: ctx.state.user.id,
        }).populate("users", ["name", "avatar"]);
        console.log(profile, "profileprofile");
        if (profile.length > 0) {
          ctx.status = 200;
          ctx.body = profile;
        }
      }
    } else {
      errors.noprofile = "没有用户信息";
      ctx.status = 404;
      ctx.body = errors;
    }
  }
);

/**
 * @router delete  api/profile/experience/delete?exp_id=''
 * @desc 删除工作经验接口地址
 * @access 接口是私有的
 */

router.post(
  "/experience/delete",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    const { exp_id } = ctx.request.body;
    console.log(exp_id);
    const profile = await Profile.find({
      user: ctx.state.user.id,
    });
    if (profile.length > 0) {
      if (profile[0].experience.length > 0) {
        const removeIndex = profile[0].experience
          .map((item) => item.id)
          .indexOf(exp_id);
        // 删除
        profile[0].experience.splice(removeIndex, 1);
        // 更新数据库
        const profileUpdate = await Profile.findOneAndUpdate(
          { user: ctx.state.user.id },
          { $set: profile[0] },
          { new: true }
        );

        ctx.status = 200;
        ctx.body = profileUpdate;
      } else {
        ctx.status = 404;
        ctx.body = { errors: "未找到相关数据" };
      }
    }
  }
);

/**
 * @router delete  api/profile/experience/delete?user_id=''
 * @desc 删除用户接口地址
 * @access 接口是私有的
 */

router.post(
  "/delete",
  passport.authenticate("jwt", { session: false }),
  async (ctx) => {
    const { user_id } = ctx.request.body;
    const profile = await Profile.deleteOne({
      user: ctx.state.user.id,
    });
    if (profile.ok === 1) {
      const user = await User.deleteOne({ _id: ctx.state.user.id });
      if (user.ok === 1) {
        ctx.status = 200;
        ctx.body = { success: "删除成功" };
      }
    } else {
      ctx.status = 404;
      ctx.body = { errors: "未找到相关数据" };
    }
  }
);

module.exports = router.routes();

/**
 * https://www.bilibili.com/video/BV15b411z7qj?p=14&spm_id_from=pageDriver
 * 现有视频已看完
 */
