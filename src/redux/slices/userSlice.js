import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    access_token: null,
    user: null,
    isAdmin: false,
};

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        user_SignIn: (state, action) => {
            const { access_token, user } = action.payload;
            state.access_token = access_token;
            state.user = user;
            state.isAdmin = user?.admin;
        },
        user_SignOut: (state) => {
            state.access_token = null;
            state.user = null;
            state.isAdmin = false;
        },
        user_UpdateProfile: (state, action) => {
            const { user } = action.payload;
            state.user = user;
        },
        update_Address: (state, action) => {
            const { province, district, ward, fullAddress } = action.payload;
            state.user = {
                ...state.user,
                address: {
                    province,
                    district,
                    ward,
                    fullAddress,
                },
            };
        },
    },
});

export const { user_SignIn, user_SignOut, user_UpdateProfile, update_Address } = userSlice.actions;

export default userSlice.reducer;
