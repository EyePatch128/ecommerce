import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'


import commerce from "../../src/commerce";
import { stripHTML } from '../../src/utils';


import React, {useState, useEffect, Fragment} from 'react'
import Header from '../../components/Header'
import { fetchCommerce } from '../../src/utils';
import { RadioGroup, Listbox, Transition } from '@headlessui/react';
import { CheckIcon, SelectorIcon } from '@heroicons/react/solid'
import Cart from '../../components/Cart';

import { useCart, updateCart} from '../../src/cartContext'


function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}

const people = [
    { name: 'Wade Cooper' },
    { name: 'Arlene Mccoy' },
    { name: 'Devon Webb' },
    { name: 'Tom Cook' },
    { name: 'Tanya Fox' },
    { name: 'Hellen Schmidt' },
  ]

export default function Single({ product, variants }) {
    const router = useRouter();
    const { pid } = router.query

    if(!product){
        return(
            <div className='absolute w-screen h-screen top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                <div className="flex justify-center items-center h-full w-full">
                    <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-indigo-500" role="status">
                        <span className="visually-hidden sr-only">Loading...</span>
                    </div>
                </div>
            </div>
        );
    }

    const [state, cartDispatch] = useCart();


    const [variantGroups, setVariantGroups] = useState(null);
    const [colors, setColors] = useState([]);
    const [selectedColor, setSelectedColor] = useState(null);
    const [colorVariantId, setColorVariantId] = useState(null);
    useEffect(()=>{
      const getColors = async ()=>{
          const {data} = await (await fetchCommerce(`v1/products/${product.id}/variant_groups`)).json();
          setVariantGroups(data);
          const {id, name, options} = data.filter(elem=>elem.name == 'Color')[0];
          setColorVariantId(id);
          if(name){
              let color_values = [];
              options.forEach(option=>{
                  
                  let color_name = option.name;                    
                  let option_id = option.id;
                  let color_value = null;
                  let color_assets = option.assets;
                  if(color_name == "black"){
                      color_value = "black";
                  }else if(color_name == "white"){
                      color_value = "white";
                  }else{
                      color_value = `${color_name}-500`;
                  };
                  color_values.push({
                      color_name,
                      option_id,
                      color_value,
                      color_assets
                  });
              });
              
              setColors(color_values);
          }
          
      }

      getColors();

    }, []);

    const [imageUrl, setImageUrl] = useState(product.image.url || null);
    const [imageId, setImageId] = useState(product.image.id || null);

    useEffect(()=>{
        const updateImage = async (color)=>{
            const asset_id = color.color_assets[0];
            if(asset_id != imageId){
              const data = await (await fetch(`/api/asset/${asset_id}`)).json();
              setImageUrl(data.url);
              setImageId(data.id);
            }
        };
        
        if(selectedColor){
            const color = colors.find(elem=>elem.option_id == selectedColor);
            updateImage(color);
        };
    }, selectedColor);

    const [selectedSize, setSelectedSize] = useState(null);
    
    const [validSizes, setValidSizes] = useState([]);
    useEffect(()=>{
        if(colorVariantId && selectedColor && variantGroups){
            let availableVariants = variants.filter(elem=>{
                if(elem.options[colorVariantId] == selectedColor){
                    return elem;
                }
            })
            const {id, name, options} = variantGroups.filter(elem=>elem.name == 'Size')[0];
            availableVariants = availableVariants.map(elem=>{
                let size = options.filter(option=>{
                    return option.id == elem.options[id]
                }).map(option=>{
                    return {
                        value: option.name,
                        option_id: option.id
                    }
                })[0];
                
                return size;
            })
            setValidSizes(availableVariants.map(elem=>elem));
        }
    }, selectedColor)

    const addToCart = e=>{
        e.preventDefault();
        const color = colors.find(elem=>elem.option_id == selectedColor);
        const sizeVrgp = variantGroups.find(elem=>elem.name == "Size").id
        const colorVrgp = variantGroups.find(elem=>elem.name == "Color").id
        
        commerce.cart.add(product.id, 1, {
            [sizeVrgp ]: selectedSize,
            [colorVrgp]: selectedColor
        })
            .then(cart=>{
                updateCart(cartDispatch)
            })
            .catch(err=>console.log(err));
        
    }

  return(
    <React.Fragment>
      <Header />
      <Cart />
      <main className='container mx-auto px-5 my-10 py-5'>
        {product?
            <div className='flex justify-between gap-10'>
                <div className='w-full basis-1/2'>
                    <Image src={imageUrl} id={imageId} layout='responsive' width="800" height="800"/>
                </div>
                <div className='flex-grow'>
                    <div className='flex gap-4 justify-between'>
                        <h3 className='font-semibold text-lg'>{product.name}</h3>
                        <h3 className='font-semibold text-lg'>{product.price.formatted_with_symbol}</h3>
                    </div>

                    <form method='post' action='' onSubmit={e=>addToCart(e)}>
                        <div className=''>
                            <h4 className='text-gray-600 font-semibold'>Color</h4>
                            <RadioGroup value={selectedColor} onChange={setSelectedColor} className="mb-4 mt-2">
                                <div className="flex items-center space-x-0.5">
                                    {colors.map((color) => (
                                        <RadioGroup.Option
                                            key={color.option_id}
                                            value={color.option_id}
                                            className={({ active, checked }) =>
                                                classNames(
                                                active && checked ? 'ring ring-offset-0.5' : '',
                                                !active && checked ? 'ring-1' : '',
                                                'ring-gray-400 -m-0.5 relative p-0.5 rounded-full flex items-center justify-center cursor-pointer focus:outline-none'
                                                )
                                            }
                                        >
                                    <RadioGroup.Label as="span" className="sr-only">
                                        {color.color_name}
                                    </RadioGroup.Label>
                                    <span
                                        aria-hidden="true"
                                        className={classNames(
                                        `bg-${color.color_value}`,
                                        'h-6 w-6 border border-black border-opacity-10 rounded-full'
                                        )}
                                    />
                                    </RadioGroup.Option>
                                ))}
                                </div>
                            </RadioGroup>
                        </div>
                        <div className='relative'>
                            <h4 className='text-gray-600 font-semibold'>Size</h4>
                            <Listbox value={selectedSize} onChange={setSelectedSize} className={`my-2 ${!selectedColor? 'pointer-events-none opacity-40': 'cursor-pointer'}`}>
                                <div className="relative mt-1">
                                <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white py-2 pl-3 pr-10 text-left border-1 border-gray-500 shadow-md focus:outline-none focus-visible:border-indigo-500 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-opacity-75 focus-visible:ring-offset-2 focus-visible:ring-offset-indigo-300 sm:text-sm">
                                    <span className="block truncate">{selectedSize? validSizes.find(elem=>elem.option_id == selectedSize).value : 'Choose your size'}</span>
                                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                                    <SelectorIcon
                                        className="h-5 w-5 text-gray-400"
                                        aria-hidden="true"
                                    />
                                    </span>
                                </Listbox.Button>
                                <Transition
                                    as={Fragment}
                                    leave="transition ease-in duration-100"
                                    leaveFrom="opacity-100"
                                    leaveTo="opacity-0"
                                >
                                    <Listbox.Options className="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                                    {validSizes.map((size, sizeIdx) => (
                                        <Listbox.Option
                                        key={sizeIdx}
                                        className={({ active }) =>
                                            `relative cursor-default select-none py-2 pl-10 pr-4 ${
                                            active ? 'bg-indigo-100 text-indigo-900' : 'text-gray-900'
                                            }`
                                        }
                                        value={size.option_id}
                                        >
                                        {({ selected }) => (
                                            <>
                                            <span
                                                className={`block truncate ${
                                                selected ? 'font-medium' : 'font-normal'
                                                }`}
                                            >
                                                {size.value}
                                            </span>
                                            {selected ? (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-indigo-600">
                                                <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                                </span>
                                            ) : null}
                                            </>
                                        )}
                                        </Listbox.Option>
                                    ))}
                                    </Listbox.Options>
                                </Transition>
                                </div>
                            </Listbox>
                        </div>
                        <div className="flex space-x-2 justify-center my-6">
                            <button
                                type="submit"
                                data-mdb-ripple="true"
                                data-mdb-ripple-color="light"
                                className="inline-block flex-grow px-6 py-4 bg-indigo-600 text-white font-medium text-xs leading-tight uppercase rounded shadow-md hover:bg-indigo-700 hover:shadow-lg focus:bg-indigo-700 focus:shadow-lg focus:outline-none focus:ring-0 active:bg-indigo-800 active:shadow-lg transition duration-150 ease-in-out"
                            >
                                Add to cart
                            </button>
                        </div>
                    </form>
                    <div className='my-4'>
                        <h4 className='text-gray-600 font-semibold'>Description</h4>
                        <p className=''>{stripHTML(product.description)}</p>
                    </div>
                </div>
            </div>
        :null
        }
      </main>
    </React.Fragment>
  )
}

export async function getStaticPaths() {
    return {
      paths: [],
      fallback: true,
    }
  }

export async function getStaticProps({params}) {
  const product = await commerce.products.retrieve(params.pid, { type: 'permalink' });
  const {data: variants} = await (await fetchCommerce(`v1/products/${product.id}/variants`)).json();

  return {
    props: {
      product,
      variants
    },
  };
}