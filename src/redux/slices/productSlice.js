import { edit } from '@cloudinary/url-gen/actions/animated';
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
        addNewCategory: (state, action) => {
            state.category.push(action.payload);
        },
        updateCategoryName: (state, action) => {
            const { id, name } = action.payload;
            const existingCategory = state.category.find((category) => category.id === id);
            if (existingCategory) {
                existingCategory.categoryName = name;
            }
        },
        deleteCategory: (state, action) => {
            const categoryId = action.payload;
            state.category = state.category.filter((category) => category.id !== categoryId);
        },
    },
});

export const { getAllCategory, resetCategory, addNewCategory, deleteCategory, updateCategoryName } =
    productSlice.actions;

export default productSlice.reducer;
