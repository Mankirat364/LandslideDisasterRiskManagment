import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    baseUrl : "http://localhost:3001"
}
const baseSlice = createSlice({
    name : "base",
    initialState,
    reducers : {
        setBaseUrl(state,action){
            state.baseUrl = action.payload;
        },
    },
});

export const {setBaseUrl} = baseSlice.actions;
export default baseSlice.reducer;