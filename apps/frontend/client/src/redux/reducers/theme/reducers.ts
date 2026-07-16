
// theme/reducer.ts
const { CLEAR_BULK_APPLICATION, SET_THEME, SET_SPLIT, SET_BULK_APPLICATIONS, ADD_BULK_APPLICATION, DELETE_BULK_APPLICATION, SET_BULK_APPLICATION } =
    require('./types').default;

const InitialState = require('./initialState').default;

const initialState = new InitialState();

interface Action {
  type: string;
  payload: any;
}

export default function theme(state = initialState, action: Action) {
  const { type, payload } = action;

  switch (type) {
    case SET_THEME: {
      // merge new theme props into the Record
      return state.merge(payload);
    }

    case SET_SPLIT: {
      return state.set('split', payload);
    }

    case SET_BULK_APPLICATIONS: {
      return state.set('bulkApplications', payload);
    }

    case SET_BULK_APPLICATION: {
      return state.set('bulkApplication', payload);
    }
    case ADD_BULK_APPLICATION: {
      return state.update('bulkApplications', (list: any[]) => {
          const index = list.findIndex(app => app.id === payload.id);
          if (index !== -1) {
              const newList = [...list];
              newList[index] = payload;
              return newList;
          }
          return [...list, payload];
      });
    }

    case DELETE_BULK_APPLICATION: {
      return state.update('bulkApplications', (list: any[]) =>
          list.filter((x: any) => x.id !== payload)
      );
    }


    case CLEAR_BULK_APPLICATION: {
      return state.set('bulkApplications', []);
    }

    default:
      return state;
  }
}
