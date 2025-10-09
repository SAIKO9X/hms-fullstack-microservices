import { createSlice } from "@reduxjs/toolkit";

// Estado simplificado - React Query gerencia os dados
interface ProfileState {
  lastUpdated: string | null;
  preferences: {
    theme: string;
    notifications: boolean;
  };
}

const initialState: ProfileState = {
  lastUpdated: null,
  preferences: {
    theme: "system",
    notifications: true,
  },
};

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    setLastUpdated: (state, action) => {
      state.lastUpdated = action.payload;
    },
    updatePreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
    },
    resetProfile: () => initialState,
  },
});

export const { setLastUpdated, updatePreferences, resetProfile } =
  profileSlice.actions;
export default profileSlice.reducer;
