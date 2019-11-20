module.exports = (db, auth) => ({
  getCurrentUser: async (req, res) => {
    const data = req.body;

    try {
      const { uid } = req.body;

      let dataUser = await db
        .ref()
        .child('users')
        .child(uid)
        .once('value');
      dataUser = dataUser.val();

      const response = {
        name: dataUser.nome,
        avatar: 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
        userid: uid,
        email: dataUser.login,
        currentAuthority: dataUser.currentAuthority,
        signature: dataUser.nome,
        title: 'Especialista em interação',
        group: 'Ant gold clothing - um certo grupo de negócios - UED',
        tags: [
          {
            key: '0',
            label: 'Muito atencioso',
          },
        ],
        notifyCount: 12,
        unreadCount: 11,
        country: 'China',
        geographic: {
          province: {
            label: 'Província de Zhejiang',
            key: '330000',
          },
          city: {
            label: '杭州市',
            key: '330100',
          },
        },
        address: '西湖区工专路 77 号',
        phone: '0752-268888888',
      };

      res.status(200).json(response);
    } catch (error) {
      res.status(200).json({
        status: 'error',
        type: data.type,
        currentAuthority: 'guest',
        error,
      });
    }
  },
  login: async (req, res) => {
    const data = req.body;
    try {
      const { uid } = req.body;

      let dataUser = await db
        .ref()
        .child('users')
        .child(uid)
        .once('value');
      dataUser = dataUser.val();


      if (dataUser.status === false) {
        throw new Error('Not authorized');
      }

      res.status(200).json({
        status: 'ok',
        type: data.type,
        currentAuthority: dataUser.currentAuthority,
      });
    } catch (error) {
      console.error(error);
      res.status(200).json({
        status: 'error',
        type: data.type,
        currentAuthority: 'guest',
        error,
      });
    }
  },
  list: async (req, res) => {
    try {
      const { query } = req;
      const usersRef = db.ref().child('users');
      let users = await usersRef.once('value');

      users = users.val();
      users = Object.keys(users).map(key => ({ ...users[key], key }));

      if (typeof query.status !== 'undefined') {
        users = users.filter(o => o.status.toString() === query.status);
      }
      if (typeof query.nome !== 'undefined' && query.nome !== '') {
        users = users.filter(o =>
          new RegExp(query.nome.toLowerCase(), 'g').test(o.nome.toLowerCase()),
        );
      }
      console.log(users);

      const response = {
        list: users,
        pagination: {
          total: users.length,
        },
      };

      res.status(200).send(response);
    } catch (error) {
      res.status(422).send(error);
    }
  },
  create: async (req, res, next) => {
    try {
      const data = req.body;
      const userRecord = await auth.createUser({
        email: data.login,
        password: data.senha,
        displayName: data.nome,
        disabled: false,
      });

      console.log('Successfully created new user:', userRecord.uid);

      const users = db.ref().child('users');
      await users.child(userRecord.uid).set({ ...data, status: true });

      next();
    } catch (error) {
      console.error(error);
      res.status(422).send(error);
    }
  },
  update: async (req, res, next) => {
    try {
      const data = req.body;
      const { id } = req.params;

      await auth.updateUser(id, {
        email: data.login,
        password: data.senha,
        displayName: data.nome,
        disabled: !data.status,
      });

      console.log('Successfully updated new user:', id);

      const users = db.ref().child('users');
      await users.child(id).set(data);

      next();
    } catch (error) {
      console.error(error);
      res.status(422).send(error);
    }
  },
  destroy: async (req, res, next) => {
    try {
      const { id } = req.params;

      await auth.deleteUser(id);
      await db
        .ref()
        .child('users')
        .child(id)
        .remove();

      next();
    } catch (error) {
      console.error(error);
      res.status(422).send(error);
    }
  },
});
