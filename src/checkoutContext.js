import React, { useEffect, useReducer} from "react";

const CheckoutContext = React.createContext();


function checkoutReducer(state, action) {
    switch (action.type) {
        case 'GENERATE': {
            return {...state, token : action.payload}
        }
        case 'CHECKOUT': {
            return {...state, checkout : action.payload}
        }
        case 'COUNTRIES': {
            return {...state, countries : action.payload}
        }
        case 'REGIONS': {
            return {...state, regions : action.payload}
        }
        case 'LIVE': {
            return {...state, live : action.payload}
        }
        case 'SHIPPING_COUNTRY': {
            return {...state, shippingCountry : action.payload}
        }
        case 'SHIPPING_REGION': {
            return {...state, shippingRegion : action.payload}
        }
        case 'SHIPPING_METHOD': {
            return {...state, shippingMethod : action.payload}
        }
        case 'STEP_PAYMENT': {
            return {...state, stepPayment: true}
        }
        case 'STEP_CHECKOUT': {
            return {...state, stepPayment: false}
        }
        case 'CUSTOMER_INFORMATION': {
            return {...state, customerInfo: action.payload}
        }
        case 'ORDER': {
            return {...state, order: action.payload}
        }
        case 'LOADING': {
            return {...state, loading: true}
        }
        case 'FINISHED': {
            return {...state, loading: false}
        }
        default: {
            throw new Error(`Unhandled action type: ${action.type}`)
        }
    }
}


function CheckoutProvider({children}) {
    const initialState = {
        token: null,
        stepPayment: false,
        customerInfo: null,
        loading: false,
        order: null
    }
    const [state, dispatch] = useReducer(checkoutReducer, initialState)
    const value = [state, dispatch];

    
    return <CheckoutContext.Provider value={value}>{children}</CheckoutContext.Provider>
}

function useCheckout() {
    const context = React.useContext(CheckoutContext)
    if (context === undefined) {
      throw new Error('useCheckout must be used within a CheckoutProvider')
    }
    return context
}

export {CheckoutProvider, useCheckout}