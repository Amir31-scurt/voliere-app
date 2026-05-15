import { createSlice } from '@reduxjs/toolkit';

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    token: localStorage.getItem('token') || null,
    user:  JSON.parse(localStorage.getItem('user') || 'null'),
  },
  reducers: {
    setCredentials: (state, { payload }) => {
      state.token = payload.token;
      state.user  = payload.user;
      localStorage.setItem('token', payload.token);
      localStorage.setItem('user', JSON.stringify(payload.user));
    },
    logout: (state) => {
      state.token = null;
      state.user  = null;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
