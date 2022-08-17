import Head from 'next/head'
import Image from 'next/image'

import commerce from "../src/commerce";


import React from 'react'
import Header from '../components/Header'
import ProductList from '../components/ProductList';
import Cart from '../components/Cart';


export default function Home({products }) {
  return(
    <React.Fragment>
      <Header />
      <Cart />
      <main className='container mx-auto px-5 my-10 py-5'>
        <h1 className='text-3xl font-bold'>Trending products</h1>
        <ProductList products={products}/>
      </main>
    </React.Fragment>
  )
}

export async function getStaticProps() {
  // const merchant = await commerce.merchants.about();
  // const { data: categories } = await commerce.categories.list();
  const { data: products } = await commerce.products.list();

  return {
    props: {
      products,
    },
  };
}