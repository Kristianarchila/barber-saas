const jwt = require("jsonwebtoken");

module.exports = function generateToken(user) {
  return jwt.sign(
    {
      id: user._id,
      rol: user.rol,
      barberiaId: user.barberiaId
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};
