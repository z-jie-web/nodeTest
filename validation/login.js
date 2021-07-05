const isEmpty = require("./isEmpty");
const Validator = require("validator");

module.exports = function validateLoginInput(data) {
  let errors = {};

  data.email = !isEmpty(data.email) ? data.email : "";
  data.password = !isEmpty(data.password) ? data.password : "";


  if (!Validator.isEmail(data.email)) {
    errors.name = "邮箱不合法";
  }


  if (Validator.isEmpty(data.email)) {
    errors.name = "邮箱不能为空";
  }


  if (Validator.isEmpty(data.password)) {
    errors.name = "密码不能为空";
  }

  if (!Validator.isLength(data.password, { min: 6, max: 18 })) {
    errors.name = "password的长度不能小于6位且不能超过18位";
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
