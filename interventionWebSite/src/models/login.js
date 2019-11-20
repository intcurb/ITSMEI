import { parse, stringify } from 'qs';
import { routerRedux } from 'dva/router';
import firebase from '@/utils/firebase';

export function getPageQuery() {
  return parse(window.location.href.split('?')[1]);
}

const logout = () =>
  firebase
    .auth()
    .signOut()
    .then(() => {
      // eslint-disable-next-line no-console
      console.log('logout successful');

      return true;
    })
    .catch(error => {
      // eslint-disable-next-line no-console
      console.error(error);
      throw error;
    });

const Model = {
  namespace: 'login',
  state: {
    status: null,
  },
  effects: {
    *logout(_, { put, call }) {
      const { redirect } = getPageQuery(); // redirect

      yield call(logout);

      if (window.location.pathname !== '/user/login' && !redirect) {
        yield put(
          routerRedux.replace({
            pathname: '/user/login',
            search: stringify({
              redirect: window.location.href,
            }),
          }),
        );
      }
    },
  },
  reducers: {
    changeLoginStatus(state, { payload }) {
      return { ...state, status: payload.status, type: payload.type };
    },
  },
};
export default Model;
