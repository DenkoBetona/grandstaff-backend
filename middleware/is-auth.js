const jwt = require('jsonwebtoken');

module.exports = async (req, res, next) => {
  const authHeader = req.get('Authorization');
  let token;
  if (!authHeader) {
    req.userId = '0';
  } else token = authHeader.split(' ')[1];
  let decodedToken;
  try {
    decodedToken = await jwt.verify(token, 'bettercallsaulgoodman');
  } catch (err) {
    req.userId = '0';
  }
  if (!decodedToken) {
    req.userId = '0';
  } else req.userId = decodedToken.userId;
  next();
};
