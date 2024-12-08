import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    theme: 'light',
    sidebar: true,
};

export const themeSlice = createSlice({
    name: 'theme',
    initialState,
    reducers: {
        toggleTheme: (state) => {
            state.theme = state.theme === 'light' ? 'dark' : 'light';
        },
        toggleSidebar: (state) => {
            state.sidebar = !state.sidebar;
        },
    },
});

export const { toggleTheme, toggleSidebar } = themeSlice.actions;

export default themeSlice.reducer;
