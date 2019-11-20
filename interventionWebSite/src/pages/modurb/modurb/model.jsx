import { fakeChartData } from './service';
import { findAll, add } from '@/services/firestore';

const initState = {
  interdictions: [],
  active: {},
};
const Model = {
  namespace: 'map',
  state: initState,
  effects: {
    *fetch(_, { call, put }) {
      const response = yield call(findAll, 'interdictions');

      yield put({
        type: 'saveInterdictions',
        payload: response,
      });
    },
    *addInterdiction({ payload, callback }, { call, put }) {
      const response = yield call(add, 'interdictions', payload);
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
    saveInterdictions(state, { payload }) {
      return { ...state, interdictions: payload };
    },
    save(state, { payload }) {
      return { ...state, active: payload };
    },
    clear() {
      return initState;
    },
  },
};
export default Model;
