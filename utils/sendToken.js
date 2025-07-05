exports.sendtoken = (message, user, statusCode, res) => {
  const token = user.getjwttoken();

  const options = {
    // Date.now() + process.env.COOKIE_EXPIRE || 2 * 24 * 60 * 60 * 1000
    expires: new Date(
      Date.now() + 2 * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    secure: true,
    sameSite: "None",
  };

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ message, success: true, id: user._id, token });
};
