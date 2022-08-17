import commerce from "../../src/commerce";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);


const calculateOrderAmount = (amount) => {
  // Replace this constant with a calculation of the order's amount
  // Calculate the order total on the server to prevent
  // people from directly manipulating the amount on the client

  return amount * 100;
};

export default async function handler(req, res) {
  const { live } = req.body;
  // const cart = await commerce.cart.retrieve(cartId);
  

  // if(cart.subtotal.raw == 0 && cart.line_items.length == 0){
  //   res.status(400).send({error: "No items in cart"});
  //   return;
  // }

  if(!live){
    res.status(400).send({error: "No items in cart"});
    return;
  }

  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(live.total_with_tax.raw),
    currency: live.currency.code,
    automatic_payment_methods: {
      enabled: true,
    },
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
};