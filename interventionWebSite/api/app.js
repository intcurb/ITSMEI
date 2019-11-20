const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
const bodyParser = require('body-parser');
const serviceAccount = require('../firebase.json');
const verifyToken = require('./middlewares/verifyToken');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: `https://${process.env.GCLOUD_PROJECT}.firebaseio.com`,
});

const auth = admin.auth();
const db = admin.database();
const app = express();

const userController = require('./controllers/user')(db, auth);
const interdictionsController = require('./controllers/interdictions')(db);

app.use(bodyParser.json({ limit: '50mb' }));
app.use(cors({ origin: 'http://localhost:8000' }));

const SUMO_DIR = path.join(__dirname, './public');
const HTML_FILE = path.join(SUMO_DIR, 'index.html');

app.use(express.static(SUMO_DIR));
app.get('/sumo', (req, res) => res.sendFile(HTML_FILE));

app.post('/users/login', userController.login);

app.get('/users', verifyToken(auth), userController.list);
app.get('/users/current', verifyToken(auth), userController.getCurrentUser);
app.post('/users', verifyToken(auth), userController.create, userController.list);
app.put('/users/:id', verifyToken(auth), userController.update, userController.list);
app.delete('/users/:id', verifyToken(auth), userController.destroy, userController.list);

app.get('/interdictions', verifyToken(auth), interdictionsController.list);
app.post(
  '/interdictions',
  verifyToken(auth),
  interdictionsController.create,
  interdictionsController.list,
);
app.put(
  '/interdictions/:id',
  verifyToken(auth),
  interdictionsController.update,
  interdictionsController.list,
);
app.put(
  '/interdictions/:id/aprove',
  verifyToken(auth),
  interdictionsController.aprove,
  interdictionsController.list,
);
app.delete(
  '/interdictions/:id',
  verifyToken(auth),
  interdictionsController.destroy,
  interdictionsController.list,
);

module.exports = app;
