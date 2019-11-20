import { create, list, update, destroy, putCustomRoute } from '@/services/custom';

const InterdictionsModel = {
  namespace: 'interdictions',
  state: {
    data: {
      list: [],
      pagination: {},
    },
  },
  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(list, 'interdictions', payload);

      yield put({
        type: 'save',
        payload: response,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(create, 'interdictions', payload, {});

      yield put({
        type: 'save',
        payload: response,
      });

      if (callback) {
        callback(response);
      }
    },
    *update({ payload, key, callback }, { call, put }) {
      const response = yield call(update, 'interdictions', payload, key);

      yield put({
        type: 'save',
        payload: response,
      });

      if (callback) {
        callback(response);
      }
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(destroy, 'interdictions', payload);

      yield put({
        type: 'save',
        payload: JSON.parse(response),
      });

      if (callback) {
        callback(response);
      }
    },
    *aprove({ key, callback }, { call, put }) {
      const response = yield call(putCustomRoute, `interdictions/${key}/aprove`);

      yield put({
        type: 'save',
        payload: response,
      });

      if (callback) {
        callback(response);
      }
    },
  },
  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
export default InterdictionsModel;
