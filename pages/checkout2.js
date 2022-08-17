import React, {useEffect, useState} from "react";


import PaymentForm from "../components/PaymentForm";
import CheckoutForm from "../components/CheckoutForm";
import Header from '../components/Header'

import commerce from "../src/commerce";

import { useCart } from '../src/cartContext'
import {useCheckout} from "../src/checkoutContext.js";
import { fetchCommerce } from "../src/utils";
import Image from "next/image";

import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);


export default function Checkout() {

  const [error, setError] = useState(false);
  const [message, setMessage] = useState("");

  const [{id: cartId }, cartDispatch] = useCart();
  const [{token, checkout, live, shippingCountry, shippingRegion, shippingMethod, loading, stepPayment, customerInfo}, checkoutDispatch] = useCheckout();
  
  useEffect(()=>{
    if(cartId){
        commerce.checkout.generateToken(cartId, { type: 'cart' })
            .then((checkout)=>{
                checkoutDispatch({type: 'GENERATE', payload: checkout.id})
                checkoutDispatch({type: 'CHECKOUT', payload: checkout})
                return checkout.id;
            })
            .catch(err=>console.log(err));
        setError(false);
        setMessage("");
    }else{
      setError(true);
      setMessage("No cart available");
    }
  }, [cartId])

  useEffect(()=>{
    if(token){
      commerce.checkout.getLive(token)
        .then(live=>{
          checkoutDispatch({type: 'LIVE', payload: live})
        })
        .catch(err=>console.log(err))
    }
  }, [token])


  // Check shipping method
  useEffect(()=>{
    if(shippingCountry && shippingRegion && shippingMethod){
      checkoutDispatch({type: "LOADING"});
      commerce.checkout.checkShippingOption(token, {
        shipping_option_id: shippingMethod,
        country: shippingCountry,
        region: shippingRegion,
      })
        .then((live) => {
          checkoutDispatch({type: "LIVE", payload: live});
          checkoutDispatch({type: "FINISHED"});
        })
        .catch(err=>console.log(err));
    }

  }, [token, shippingCountry, shippingRegion, shippingMethod])


  const [clientSecret, setClientSecret] = useState('');
  
  useEffect(() => {

    if(stepPayment){
      fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ live }),
      })
        .then((res) => res.json())
        .then((data) => {
          if(data.error){
            setError(data.error);
          }else{
            setClientSecret(data.clientSecret)
            setError("");
          }
        });
    }

  }, [token, live, stepPayment]);
  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };



  if(!checkout || !live){
    return (
      <div className='absolute h-full w-full flex justify-center items-center bg-gray-500 bg-opacity-20 transition-opacity'>
          <div className="flex justify-center items-center ">
              <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-indigo-500" role="status">
                  <span className="visually-hidden">Loading...</span>
              </div>
          </div>
      </div>
    );
  }

  return (
    <React.Fragment>
        <main className="container mx-auto p-5">
          <div className="bg-gray-100 mt-12 w-full rounded flex justify-between gap-20">
            <section className="divide-y basis-1/2 p-8 relative">
              {
                clientSecret && stepPayment ? 
                  <Elements options={options} stripe={stripePromise}>
                    <PaymentForm />
                  </Elements>
                  :
                  <CheckoutForm /> 
                
              }
            </section>

            <section className="basis-1/2 p-8 relative">

              {loading && (
                <div className='absolute top-0 left-0 h-full w-full rounded-md flex justify-center items-center bg-gray-300 bg-opacity-20 transition-opacity'>
                  <div className="flex justify-center items-center ">
                      <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-indigo-500" role="status">
                          <span className="visually-hidden">Loading...</span>
                      </div>
                  </div>
                </div>
              )}
              <h3 className="font-semibold text-lg">Order summary</h3>
              
              <div className="flex flex-col gap-10 divide-y">
                <ul className="divide-y">
                  {live.line_items.map(item=>{
                    return(
                      <li key={item.id} className="flex py-6">
                        <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                            <Image
                              src={item.image.url}
                              alt={item.image.alt}
                              className="h-full w-full object-cover object-center"
                              layout="responsive"
                              width={48}
                              height={48}
                            />
                        </div>

                        <div className="ml-4 flex flex-1 flex-col">
                          <div>
                            <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3>
                                  <a href={`/products/${item.permalink}`}> {item.name} </a>
                                </h3>
                                <p className="ml-4">{item.price.formatted_with_symbol}</p>
                            </div>
                          </div>
                            <div className='flex gap-4 text-sm mt-2'>
                              {item.selected_options.map(elem=>(
                                  <p key={elem.group_id} className="text-gray-500">{elem.group_name}: {elem.option_name}</p>
                              ))}
                            </div>
                            <div className="flex flex-1 items-end justify-between text-sm">
                              <p className="text-gray-500">Qty {item.quantity}</p>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <div className="flex flex-col gap-4 text-gray-700 font-semibold py-5">
                  <div className="flex justify-between">
                    <p>Subtotal</p>
                    <p>{live.subtotal.formatted_with_symbol}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Shipping</p>
                    <p>{live.shipping.price.formatted_with_symbol}</p>
                  </div>
                  <div className="flex justify-between">
                    <p>Taxes</p>
                    <p>{live.tax.amount.formatted_with_symbol}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-4 text-gray-700 font-semibold py-5">
                  <div className="flex justify-between">
                    <p>Total</p>
                    <p>{live.total.formatted_with_symbol}</p>
                  </div>
                </div>

              </div>
            </section>
          </div>
        </main>
    </React.Fragment>
  );
}