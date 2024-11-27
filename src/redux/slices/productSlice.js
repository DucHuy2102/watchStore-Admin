import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    category: [],
};

export const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        getAllCategory: (state, action) => {
            state.category = action.payload;
        },
        resetCategory: (state) => {
            state.category = [];
        },
    },
});

export const { getAllCategory, resetCategory } = productSlice.actions;

export default productSlice.reducer;
