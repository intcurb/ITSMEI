import firebase from 'firebase';
import 'firebase/database';
import 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: 'AIzaSyBYs_QbIDTMkvZRC61SdyD5AFwX_vmY4JA',
  authDomain: 'inttran-1560013137753.firebaseapp.com',
  databaseURL: 'https://inttran-1560013137753.firebaseio.com',
  projectId: 'inttran-1560013137753',
  storageBucket: 'inttran-1560013137753.appspot.com',
  messagingSenderId: '853691960573',
  appId: '1:853691960573:web:714d9741f0ffc820b24294',
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export default firebase;
