import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import leadReducer from './slices/leadSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    leads: leadReducer,
  },
});