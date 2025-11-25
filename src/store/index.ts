import { configureStore } from '@reduxjs/toolkit'
import devicesReducer from './slices/deviceSlice'
import searchReducer from './slices/searchSlice'
import userReducer from './slices/userSlice';
import amperageApplicationReducer from './slices/amperage_applicationSlice';

export const store = configureStore({
  reducer: {
    devices: devicesReducer,
    search: searchReducer,
    user: userReducer,
    amperage_application: amperageApplicationReducer
  },
  devTools: true
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch