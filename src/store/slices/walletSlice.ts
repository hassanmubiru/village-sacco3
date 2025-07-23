import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { bitnobService } from '../../services/bitnob.service';
import { WalletBalance, BitnobTransaction } from '../../types/bitnob.types';

interface WalletState {
  balance: WalletBalance | null;
  transactions: BitnobTransaction[];
  loading: boolean;
  error: string | null;
  walletId: string | null;
}

const initialState: WalletState = {
  balance: null,
  transactions: [],
  loading: false,
  error: null,
  walletId: null,
};

// Async thunks for wallet operations
export const createWallet = createAsyncThunk(
  'wallet/createWallet',
  async (userData: { phoneNumber: string; email: string; firstName: string; lastName: string }) => {
    const response = await bitnobService.createWallet(userData);
    return response;
  }
);

export const fetchWalletBalance = createAsyncThunk(
  'wallet/fetchBalance',
  async (walletId: string) => {
    const response = await bitnobService.getWalletBalance(walletId);
    return response;
  }
);

export const fetchTransactionHistory = createAsyncThunk(
  'wallet/fetchTransactions',
  async (walletId: string) => {
    const response = await bitnobService.getTransactionHistory(walletId);
    return response;
  }
);

export const sendLightningPayment = createAsyncThunk(
  'wallet/sendLightningPayment',
  async (paymentData: {
    amount: number;
    currency: string;
    recipientId?: string;
    phoneNumber?: string;
    email?: string;
    reference: string;
    narration?: string;
  }) => {
    const response = await bitnobService.sendLightningPayment(paymentData);
    return response;
  }
);

export const createLightningInvoice = createAsyncThunk(
  'wallet/createInvoice',
  async (invoiceData: {
    amount: number;
    currency: string;
    reference: string;
    memo?: string;
    expiresIn?: number;
  }) => {
    const response = await bitnobService.createLightningInvoice(invoiceData);
    return response;
  }
);

export const getExchangeRates = createAsyncThunk(
  'wallet/getExchangeRates',
  async (baseCurrency: string = 'BTC') => {
    const response = await bitnobService.getExchangeRates(baseCurrency);
    return response;
  }
);

const walletSlice = createSlice({
  name: 'wallet',
  initialState,
  reducers: {
    clearWalletError: (state) => {
      state.error = null;
    },
    setWalletId: (state, action: PayloadAction<string>) => {
      state.walletId = action.payload;
    },
    updateBalance: (state, action: PayloadAction<WalletBalance>) => {
      state.balance = action.payload;
    },
    addTransaction: (state, action: PayloadAction<BitnobTransaction>) => {
      state.transactions.unshift(action.payload);
    },
    updateTransaction: (state, action: PayloadAction<{ id: string; updates: Partial<BitnobTransaction> }>) => {
      const { id, updates } = action.payload;
      const transactionIndex = state.transactions.findIndex(tx => tx.id === id);
      if (transactionIndex !== -1) {
        state.transactions[transactionIndex] = { ...state.transactions[transactionIndex], ...updates };
      }
    },
  },
  extraReducers: (builder) => {
    // Create Wallet
    builder
      .addCase(createWallet.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWallet.fulfilled, (state, action) => {
        state.loading = false;
        state.walletId = action.payload.id;
        state.balance = {
          btc: 0,
          satoshis: 0,
          fiat: 0,
          currency: 'UGX',
          lastUpdated: new Date().toISOString(),
        };
      })
      .addCase(createWallet.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create wallet';
      });

    // Fetch Balance
    builder
      .addCase(fetchWalletBalance.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWalletBalance.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = {
          btc: action.payload.btc || 0,
          satoshis: action.payload.satoshis || 0,
          fiat: action.payload.fiat || 0,
          currency: action.payload.currency || 'UGX',
          lastUpdated: new Date().toISOString(),
        };
      })
      .addCase(fetchWalletBalance.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch balance';
      });

    // Fetch Transactions
    builder
      .addCase(fetchTransactionHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload.transactions || [];
      })
      .addCase(fetchTransactionHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch transactions';
      });

    // Send Lightning Payment
    builder
      .addCase(sendLightningPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(sendLightningPayment.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new transaction to the list
        if (action.payload.transaction) {
          state.transactions.unshift(action.payload.transaction);
        }
      })
      .addCase(sendLightningPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Payment failed';
      });

    // Create Lightning Invoice
    builder
      .addCase(createLightningInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createLightningInvoice.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createLightningInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create invoice';
      });

    // Get Exchange Rates
    builder
      .addCase(getExchangeRates.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getExchangeRates.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(getExchangeRates.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch exchange rates';
      });
  },
});

export const { 
  clearWalletError, 
  setWalletId, 
  updateBalance, 
  addTransaction, 
  updateTransaction 
} = walletSlice.actions;

export default walletSlice.reducer;
