import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import saccoReducer from './slices/saccoSlice';
import walletReducer from './slices/walletSlice';
import transactionReducer from './slices/transactionSlice';
import adminReducer from './slices/adminSlice';
import governanceReducer from './slices/governanceSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    sacco: saccoReducer,
    wallet: walletReducer,
    transactions: transactionReducer,
    admin: adminReducer,
    governance: governanceReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
