module.exports = auth => async (req, res, next) => {
  const idToken = req.headers.authorization;

  try {
    const decoded = await auth.verifyIdToken(idToken);

    if (decoded) {
      req.body.uid = decoded.uid;
      return next();
    }
    return res.status(401).send('Not authorized');
  } catch (error) {
    console.error(error);
    return res.status(401).send(error);
  }
};
