import { create } from '@/services/custom';

const initState = {
  interdictions: [],
  active: {},
};

const Model = {
  namespace: 'map',
  state: initState,
  effects: {
    *addInterdiction({ payload, callback }, { call, put }) {
      const response = yield call(create, 'interdictions', payload);
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
    save(state, { payload }) {
      return { ...state, active: payload };
    },
  },
};
export default Model;
