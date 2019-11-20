import { routerRedux } from 'dva/router';
import { getFakeCaptcha } from './service';
import { getPageQuery, setAuthority } from './utils/utils';
import { postCustomRoute } from '@/services/custom';
import firebase from '@/utils/firebase';

const login = async payload => {
  try {
    const { userName, password } = payload;
    const user = await firebase.auth().signInWithEmailAndPassword(userName, password);
    const { uid } = user.user;
    const response = await postCustomRoute('users/login', { ...payload, uid });

    if (response.status === 'error') {
      console.log('caiu aqui no error');
      throw new Error(response.error);
    }

    return response;
  } catch (error) {
    await firebase.auth().signOut();
    return {
      status: 'error',
      type: payload.type,
      currentAuthority: 'guest',
    };
  }
};

const Model = {
  namespace: 'userLogin',
  state: {
    status: undefined,
  },
  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(login, payload);
      console.log(response);

      yield put({
        type: 'changeLoginStatus',
        payload: response,
      }); // Login successfully

      yield put({
        type: 'login/changeLoginStatus',
        payload: response,
      });

      if (response.status === 'ok') {
        const urlParams = new URL(window.location.href);
        const params = getPageQuery();
        let { redirect } = params;

        if (redirect) {
          const redirectUrlParams = new URL(redirect);

          if (redirectUrlParams.origin === urlParams.origin) {
            redirect = redirect.substr(urlParams.origin.length);

            if (redirect.match(/^\/.*#/)) {
              redirect = redirect.substr(redirect.indexOf('#') + 1);
            }
          } else {
            window.location.href = redirect;
            return;
          }
        }

        yield put(routerRedux.replace(redirect || '/'));
      }
    },
    *getCaptcha({ payload }, { call }) {
      yield call(getFakeCaptcha, payload);
    },
  },
  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);

      return { ...state, status: payload.status, type: payload.type };
    },
  },
};
export default Model;
