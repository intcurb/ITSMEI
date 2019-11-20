const _ = require('lodash');
const moment = require('moment');

module.exports = db => ({
  list: async (req, res) => {
    try {
      const { query } = req;

      const { uid } = req.body;
      let dataUser = await db
        .ref()
        .child('users')
        .child(uid)
        .once('value');
      dataUser = dataUser.val();

      const interdictionsRef = db.ref().child('interdictions');
      let interdictions = await interdictionsRef.once('value');
      interdictions = interdictions.val();

      interdictions = Object.keys(interdictions).map(key => ({ ...interdictions[key], key }));
      interdictions = _.orderBy(interdictions, 'createdAt', 'desc');

      if (dataUser.currentAuthority !== 'admin') {
        interdictions = interdictions.filter(o => o.userId === uid);
      }

      if (typeof query.status !== 'undefined') {
        interdictions = interdictions.filter(o => o.status === query.status);
      }
      if (typeof query.nome !== 'undefined' && query.nome !== '') {
        interdictions = interdictions.filter(o => o.nome === query.nome);
      }

      const response = {
        list: interdictions,
        pagination: {
          total: interdictions.length,
        },
      };

      res.status(200).send(response);
    } catch (error) {
      res.status(422).send(error);
    }
  },
  create: async (req, res) => {
    try {
      const { uid } = req.body;

      let dataUser = await db
        .ref()
        .child('users')
        .child(uid)
        .once('value');
      dataUser = dataUser.val();

      const data = { ...req.body, organization: dataUser.nome, userId: uid, createdAt: moment().format("YYYY-MM-DD HH:mm:ss") };

      const rootRef = db.ref();
      const interdictions = rootRef.child('interdictions');
      const response = await interdictions.push(data);

      res.status(200).send(response);
    } catch (error) {
      res.status(422).send(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const data = req.body;
      const { id } = req.params;

      const interdictions = db.ref().child('interdictions');
      await interdictions.child(id).set(data);

      next();
    } catch (error) {
      console.error(error);
      res.status(422).send(error);
    }
  },
  aprove: async (req, res, next) => {
    try {
      const { id } = req.params;

      const interdictions = db.ref().child('interdictions');
      await interdictions
        .child(id)
        .child('status')
        .set(true);

      next();
    } catch (error) {
      console.error(error);
      res.status(422).send(error);
    }
  },
  destroy: async (req, res, next) => {
    try {
      const { id } = req.params;

      await db
        .ref()
        .child('interdictions')
        .child(id)
        .remove();

      next();
    } catch (error) {
      console.error(error);
      res.status(422).send(error);
    }
  },
});
