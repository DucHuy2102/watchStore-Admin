import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    category: [],
    orders: [],
    newOrdersCount: 0,
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
        setOrders: (state, action) => {
            state.orders = action.payload;
        },
        updateOrder: (state, action) => {
            const newOrder = action.payload;
            const index = state.orders.findIndex((order) => order.id === newOrder.id);
            if (index !== -1) {
                state.orders[index] = newOrder;
            } else {
                state.orders.push(newOrder);
                state.newOrdersCount += 1;
            }
        },
        resetNewOrdersCount: (state) => {
            state.newOrdersCount = 0;
        },
    },
});

export const { getAllCategory, resetCategory, setOrders, updateOrder, resetNewOrdersCount } =
    productSlice.actions;

export default productSlice.reducer;
