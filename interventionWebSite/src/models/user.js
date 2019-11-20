import { queryCurrent } from '@/services/user';
import { create, list, update, destroy, getCustomRoute } from '@/services/custom';

const UserModel = {
  namespace: 'user',
  state: {
    currentUser: {},
    data: {
      list: [],
      pagination: {},
    },
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(list, 'users', payload);

      yield put({
        type: 'save',
        payload: response,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(create, 'users', payload, {});

      yield put({
        type: 'save',
        payload: response,
      });

      if (callback) {
        callback(response);
      }
    },
    *update({ payload, key, callback }, { call, put }) {
      const response = yield call(update, 'users', payload, key);

      console.log(response);
      console.log('aquiiiii');

      yield put({
        type: 'save',
        payload: response,
      });

      if (callback) {
        callback(response);
      }
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(destroy, 'users', payload);

      yield put({
        type: 'save',
        payload: response,
      });

      if (callback) {
        callback(response);
      }
    },
    *fetchCurrent(_, { call, put }) {
      const response = yield call(getCustomRoute, 'users/current');
      yield put({
        type: 'saveCurrentUser',
        payload: response,
      });
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
    saveCurrentUser(state, action) {
      return { ...state, currentUser: action.payload || {} };
    },

    changeNotifyCount(
      state = {
        currentUser: {},
      },
      action,
    ) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload.totalCount,
          unreadCount: action.payload.unreadCount,
        },
      };
    },
  },
};
export default UserModel;
