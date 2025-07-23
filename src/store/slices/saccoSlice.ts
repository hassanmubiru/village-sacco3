import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SaccoGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  total_savings: number;
  created_at: string;
}

interface SaccoState {
  groups: SaccoGroup[];
  currentGroup: SaccoGroup | null;
  loading: boolean;
}

const initialState: SaccoState = {
  groups: [],
  currentGroup: null,
  loading: false,
};

const saccoSlice = createSlice({
  name: 'sacco',
  initialState,
  reducers: {
    setGroups: (state, action: PayloadAction<SaccoGroup[]>) => {
      state.groups = action.payload;
    },
    setCurrentGroup: (state, action: PayloadAction<SaccoGroup>) => {
      state.currentGroup = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setGroups, setCurrentGroup, setLoading } = saccoSlice.actions;
export default saccoSlice.reducer;


