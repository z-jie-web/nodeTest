const isEmpty = require("./isEmpty");
const Validator = require("validator");

module.exports = function validateProfileInput(data) {
  let errors = {};

  data.handle = !isEmpty(data.handle) ? data.handle : "";
  data.status = !isEmpty(data.status) ? data.status : "";
  data.skills = !isEmpty(data.skills) ? data.skills : "";

  if (!Validator.isLength(data.handle, { min: 2, max: 40 })) {
    errors.handle = "handle的长度不能小于2位且不能超过40位";
  }

  if (Validator.isEmpty(data.handle)) {
    errors.handle = "handle不能为空";
  }

  if (Validator.isEmpty(data.status)) {
    errors.status = "status不能为空";
  }

  if (Validator.isEmpty(data.skills)) {
    errors.skills = "skills不能为空";
  }

  if (!Validator.isEmpty(data.website)) {
    if (!Validator.isURL(data.website)) {
      errors.website = "URL不合法";
    }
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};
