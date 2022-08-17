import React, {useEffect, useState} from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";

import CheckoutForm from "../components/CheckoutForm";
import Header from '../components/Header'

import { useCart } from '../src/cartContext'


const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

async 


export default function Checkout() {

  useEffect(()=>{

  }, [])



  const [clientSecret, setClientSecret] = useState("");
  const [error, setError] = useState("");

  const [{id: cartId, items}, cartDispatch] = useCart();
  useEffect(() => {
    // Create PaymentIntent as soon as the page loads
    fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cartId }),
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
  }, [cartId]);

  const appearance = {
    theme: 'stripe',
  };
  const options = {
    clientSecret,
    appearance,
  };

  return (
    <React.Fragment>
        <Header />
        {error && (
          <p>{error}</p>
        )}
        {clientSecret && (
            <Elements options={options} stripe={stripePromise}>
                <div className="container mx-auto px-14 py-5 mt-14 flex justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-700 mb-10">Cart items</h3>
                    <ul role="list" className="-my-6 divide-y divide-gray-200">
                      {items && items.map((item) => (
                          <li key={item.id} className="flex py-6">
                          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              <img
                              src={item.image.url}
                              alt={item.image.alt}
                              className="h-full w-full object-cover object-center"
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

                              {/* <div className="flex">
                                  <button
                                  type="button"
                                  className="font-medium text-indigo-600 hover:text-indigo-500"
                                  onClick={()=>removeItem(item.id)}
                                  >
                                  Remove
                                  </button>
                              </div> */}
                              </div>
                          </div>
                          </li>
                        ))}
                      </ul>
                  </div>
                  <CheckoutForm />
                </div>
            </Elements>
        )}
  </React.Fragment>
  );
}