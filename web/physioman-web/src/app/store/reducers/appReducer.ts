import { LOGGEDIN, LOGGEDOUT, HASBOOKING, HASORDERED } from '../actions/actions';

interface State {
    loggedIn: boolean;
    hasBooking: boolean;
    hasOrdered: boolean;
}

const initialState = {
    loggedIn: false,
    hasBooking: false,
    hasOrdered: false
};

export const appReducer = (state = initialState, action) => {
    switch (action.type) {
        case LOGGEDIN:
        return {
            ...state,
            loggedIn: true
        };

        case LOGGEDOUT:
        return initialState;

        case HASBOOKING:
        return {
            ...state,
            hasBooking: true
        };

        case HASORDERED:
        return {
            ...state,
            hasOrdered: true
        }; // more actions to follow
    }
    return state;
};
