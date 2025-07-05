const jwt = require("jsonwebtoken");
const { catchAsyncErrors } = require("./catchAsyncErrors.js");

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.json({
      success: false,
      message: "Please Login",
    });
  }

  const { id } = jwt.verify(token, process.env.JWT_SECRET || "azsxdcfvgbhnj");
  req.id = id;
  next();
});
