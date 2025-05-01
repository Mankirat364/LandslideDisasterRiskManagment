import {configureStore} from '@reduxjs/toolkit'
import baseReducer from './baseApiSlice'
export const store = configureStore({
    reducer : {
        base : baseReducer
    }
})