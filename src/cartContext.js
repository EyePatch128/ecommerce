import React, { useEffect, useReducer} from "react";
import commerce from "./commerce";

const CartContext = React.createContext();


function cartReducer(state, action) {
    switch (action.type) {
      case 'OPEN': {
        return {...state, open: true}
      }
      case 'CLOSE': {
        return {...state, open: false}
      }
      case 'RETRIEVE': {
        const {id, line_items, subtotal} = action.payload
        return {...state, 
            id,
            items: line_items,
            subtotal: subtotal.formatted_with_symbol
        };
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

async function updateCart(dispatch) {
    
    try {
        dispatch({type: 'LOADING'})

        const cart = await commerce.cart.retrieve();   
        dispatch({
            type: "RETRIEVE",
            payload: cart
        });

        dispatch({type: 'FINISHED'})

    } catch (err) {
      console.log("Fail fetch cart :", err)
    }
}


function CartProvider({children}) {
    const initialState = {
        open: false
    }
    const [state, dispatch] = useReducer(cartReducer, initialState)
    const value = [state, dispatch];

    useEffect(()=>{
        updateCart(dispatch);
    }, [])

    
    
    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

function useCart() {
    const context = React.useContext(CartContext)
    if (context === undefined) {
      throw new Error('useCount must be used within a CountProvider')
    }
    return context
}

export {CartProvider, useCart, updateCart}