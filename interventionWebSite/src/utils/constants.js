const { version } = require('../../package.json');

export const REACT_APP_GEOCODE_ACESS_TOKEN = 'AIzaSyA0bHmfyBAQD-sTABWIv11xMt1vlq8Dcg8';
export const FIREBASE_ACCESS_TOKEN = 'AIzaSyBYs_QbIDTMkvZRC61SdyD5AFwX_vmY4JA';


export const APP_VERSION = `v${version.split('.')[0]}`;
export const API_HOST =
  process.env.NODE_ENV === 'production' ? 'https://localhost:9000' : 'http://localhost:5000';
export const ERR_TOO_MANY_LOGIN_ATEMPTS = 'ERR_TOO_MANY_LOGIN_ATEMPTS';
export const G_API_URL = `https://maps.googleapis.com/maps/api/js?key=${REACT_APP_GEOCODE_ACESS_TOKEN}&&v=3.exp&libraries=geometry,drawing,places`;
