import '../styles/globals.css'
import React, { useEffect, useState } from 'react';

import {CartProvider} from "../src/cartContext.js";
import {CheckoutProvider, checkoutProvider} from "../src/checkoutContext";

function MyApp({ Component, pageProps }) {
  
  useEffect(() => {
    const use = async () => {
      (await import('tw-elements')).default;
        };
        use();
  }, []);

  // const [isCartOpen, setIsCartOpen] = useState(false);
  return (
    <CartProvider>
      <CheckoutProvider>
        <Component {...pageProps} />
      </CheckoutProvider>
    </CartProvider>
    );
}

export default MyApp
