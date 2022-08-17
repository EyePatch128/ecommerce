import React, {useState, useEffect} from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
  CardElement
} from "@stripe/react-stripe-js";

import { useCheckout } from "../src/checkoutContext";
import commerce from "../src/commerce";

export default function PaymentForm() {
  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      return;
    }

    const clientSecret = new URLSearchParams(window.location.search).get(
      "payment_intent_client_secret"
    );

    if (!clientSecret) {
      return;
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }) => {
      switch (paymentIntent.status) {
        case "succeeded":
          setMessage("Payment succeeded!");
          break;
        case "processing":
          setMessage("Your payment is processing.");
          break;
        case "requires_payment_method":
          setMessage("Your payment was not successful, please try again.");
          break;
        default:
          setMessage("Something went wrong.");
          break;
      }
    });
  }, [stripe]);


  const [{token, stepPayment, customerInfo}, checkoutDispatch] = useCheckout();

  const stripePaymentMethodHandler = async (result) => {
    if (result.error) {
      // Show error in payment form
      setMessage(result.error.message)
    } else {
      // Otherwise send paymentIntent.id to your server
      checkoutDispatch({type: 'LOADING'});
      try{
        const order = await commerce.checkout.capture(token, {
          customer : {
            firstname: customerInfo.firstname,
            lastname: customerInfo.lastname,
            email: customerInfo.email
          },
          shipping: {
            name: `${customerInfo.firstname} ${customerInfo.lastname}`,
            street: customerInfo.address,
            town_city: customerInfo.city,
            county_state: customerInfo.region,
            postal_zip_code: customerInfo.postal_zip_code,
            country: customerInfo.country 
          },
          fulfillment: {
            shipping_method: customerInfo.shipping
          },
          payment: {
            gateway: 'stripe',
            card: {
              payment_intent_id: result.paymentIntent.id
            }
          },
        });
        checkoutDispatch({type: 'ORDER', payload: order});

      } catch(response){
        console.log(response);
        alert(response.message);
      } finally {
        checkoutDispatch({type: 'FINISHED'});
      }
    }
  };

  const handleSubmit = async (e)=>{
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsLoading(true);

    const paymentElement = elements.getElement(PaymentElement)
    console.log(paymentElement)
    const paymentMethodResponse = await stripe.createPaymentMethod({ type: 'payment', paymentElement });

    if (paymentMethodResponse.error) {
      // There was some issue with the information that the customer entered into the payment details form.
      alert(paymentMethodResponse.error.message);
      return;
    }
    
    // checkoutDispatch({type: 'LOADING'});
    //   try{
    //     const order = await commerce.checkout.capture(token, {
    //       customer : {
    //         firstname: customerInfo.firstname,
    //         lastname: customerInfo.lastname,
    //         email: customerInfo.email
    //       },
    //       shipping: {
    //         name: `${customerInfo.firstname} ${customerInfo.lastname}`,
    //         street: customerInfo.address,
    //         town_city: customerInfo.city,
    //         county_state: customerInfo.region,
    //         postal_zip_code: customerInfo.postal_zip_code,
    //         country: customerInfo.country 
    //       },
    //       fulfillment: {
    //         shipping_method: customerInfo.shipping
    //       },
    //       payment: {
    //         gateway: 'stripe',
    //         card: {
    //           payment_method_id: paymentMethodResponse.paymentMethod.id
    //         }
    //       },
    //     });
    //     checkoutDispatch({type: 'ORDER', payload: order});

    //   } catch(response){
    //     console.log(response);
    //     alert(response.message);
    //   } finally {
    //     checkoutDispatch({type: 'FINISHED'});
    //   }

  }
  
  return (
    
    <div className="flex justify-center align-middle">
      <form id="payment-form" onSubmit={handleSubmit} className="py-8 px-10 shadow-lg bg-white rounded-md">
        <PaymentElement id="payment-element" />

          <button disabled={isLoading || !stripe || !elements} id="submit" className="flex items-center w-full mt-12 justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700">
              <span id="button-text">
              {isLoading ? <div className="spinner" id="spinner"></div> : "Pay now"}
              </span>
          </button>

        {/* Show any error or success messages */}
        {message && <div id="payment-message" className="">{message}</div>}
      </form>
    </div>
  );
}