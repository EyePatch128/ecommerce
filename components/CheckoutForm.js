import React, { useState, useEffect } from 'react'
import { Formik, Field, Form, ErrorMessage, useField, useFormikContext, FieldArray } from 'formik';
import * as Yup from "yup"

import commerce from '../src/commerce.js';

import {useCheckout} from "../src/checkoutContext.js";


const RegionSelect = (props) => {
    const [{token}, checkoutDispatch] = useCheckout();
    const {
      values: { country },
      setFieldValue,
    } = useFormikContext();
    const [field, meta] = useField(props);

    const [listRegionsJSX, setListRegionsJSX] = useState('');
    useEffect(() => {
      if (token && country) {
        props.setloading(true);
        commerce.services.localeListSubdivisions(country)
            .then(res=>{
                let regions = Object.entries(res.subdivisions).map(([code, name], idx)=>{
                    return <option value={code} key={idx}>{name}</option>
                });
                const default_region_code = Object.entries(res.subdivisions)[0][0];
                setListRegionsJSX(regions);
                setFieldValue("region", default_region_code);
                props.setloading(false);
            })
            .catch(err=>console.log(err))
      }
    }, [token, country]);
  
    return (
      <>
        <select {...props} {...field} className={props.inputstyle}>
            {listRegionsJSX}
        </select>
        {!!meta.touched && !!meta.error && <div>{meta.error}</div>}
      </>
    );
};

const ShippingRadio = (props)=>{
    const [{token}, checkoutDispatch] = useCheckout();

    const {
        values: { country, region },
        setFieldValue,
      } = useFormikContext();
    const [field, meta] = useField(props);

    const [shippingMethods, setShippingMethods] = useState([]); 
    useEffect(()=>{
        props.setloading(true);
        if(country && region){
            commerce.checkout.getShippingOptions(token, {
                country: country,
                region: region,
            })
                .then((res) =>{
                    setShippingMethods(res)
                    props.setloading(false);
                })
                .catch(err=>{
                    console.log(err);
                })
        }
    }, [token, country, region]);

    const updateShipping = e=>{
        const shippingId = e.target.value;
        setFieldValue(field.name, shippingId)
        checkoutDispatch({type: 'SHIPPING_COUNTRY', payload: country})
        checkoutDispatch({type: 'SHIPPING_REGION', payload: region})
        checkoutDispatch({type: 'SHIPPING_METHOD', payload: shippingId})
    }

    if(shippingMethods){
        return (
            <>
                <fieldset {...props} {...field} className="flex gap-4" onChange={updateShipping}>
                    {shippingMethods && shippingMethods.map(elem=>(
                        <div key={elem.id} className="border bg-white px-4 py-4 flex items-center gap-2 rounded-md flex-1">
                            <input 
                                name="shipping"
                                type="radio"
                                value={elem.id}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 cursor-pointer"
                            />
                            <div className="flex flex-col h-full justify-between text-sm font-medium">
                                <label className="block text-gray-700">
                                    {elem.description}
                                </label>
                                <p className="text-indigo-500">{elem.price.formatted_with_symbol}</p>
                            </div>
                        </div>
                    ))}
                </fieldset>
            </>
        );
    }else{
        return null
    }

}

export default function CheckoutForm() {
    const [country, setCountry] = useState("");
    const [loading, setLoading] = useState(false);

    const initialValues={
        email: '',
        firstname: '',
        lastname: '',
        address: '',
        city: '',
        country: country,
        region: '',
        postalcode: '',
        shipping: ''
    }

    const inputstyle= "focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md";

    const [{token, stepPayment}, checkoutDispatch] = useCheckout();
    const [listCountriesJSX, setListCountriesJSX] = useState([]);
    useEffect(()=>{
        if(token){
            setLoading(true);   
            commerce.services.localeListShippingCountries(token)
                .then(res=>{
                    let countries = Object.entries(res.countries);
                    const default_country_code = countries[0][0];
                    setCountry(default_country_code)
                    countries = countries.map(([code, name], idx)=>{
                        return <option value={code} key={idx}>{name}</option>
                    })
                    setListCountriesJSX(countries);
                    setLoading(false);
                })
                .catch(err=>console.log(err))
        }
      }, [token]);

    
    return (
    
        <Formik 
            initialValues={initialValues}
            validationSchema={Yup.object({
                email: Yup.string()
                .email('Invalid email address')
                .required('Required'),
                firstname: Yup.string()
                .max(20, 'Must be 20 characters or less')
                .required('Required'),
                lastname: Yup.string()
                .max(20, 'Must be 20 characters or less')
                .required('Required'),
                address: Yup.string()
                .required('Required'),
                city: Yup.string()
                .required('Required'),
                country: Yup.string()
                .required('Required'),
                region: Yup.string()
                .required('Required'),
                postalcode: Yup.string()
                .required('Required'),
                shipping: Yup.string()
                .required('Required')
            })}
            onSubmit={(values, { setSubmitting }) => {
                setTimeout(() => {
                    checkoutDispatch({type: "CUSTOMER_INFORMATION", payload: values});
                    checkoutDispatch({type: "STEP_PAYMENT"});
                    setSubmitting(false);
                }, 400);
            }}
            
            enableReinitialize={true}
        >
            {formik=>(
                <Form className=''>
                    {loading && (
                        <div className='absolute h-full w-full top-0 left-0 flex justify-center items-center bg-gray-300 rounded-md bg-opacity-20 transition-opacity'>
                            <div className="flex justify-center items-center ">
                                <div className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-indigo-500" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="py-6">
                        <h3 className="font-semibold text-lg">Contact information</h3>
                        <div className="flex my-3">
                            <div className="flex-1">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                                <Field name="email" type="email" className={inputstyle} placeholder="name@example.com"/>
                                <ErrorMessage name="email" component="p" className='text-sm text-red-500 font-medium'/>
                            </div>
                        </div>
                    </div>
    
                    <div className="py-6">
                        <h3 className="font-semibold text-lg">Shipping information</h3>
        
                        <div className="flex my-3 gap-4 justify-between">
                            <div className="flex-1">
                                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">First name</label>
                                <Field name="firstname" type="text" className={inputstyle} placeholder="Jhon"/>
                                <ErrorMessage name="firstname" component="p" className='text-sm text-red-500 font-medium'/>   
                            </div>
                            <div className="flex-1">
                                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">Last name</label>
                                <Field name="lastname" type="text" className={inputstyle} placeholder="Doe"/>
                                <ErrorMessage name="lastname" component="p" className='text-sm text-red-500 font-medium'/> 
                            </div>
                        </div>
                        
                        <div className="flex my-3 gap-4">
                            <div className="basis-full">
                                <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                                <Field name="address" type="text" className={inputstyle} placeholder="N° Street Name"/>
                                <ErrorMessage name="address" component="p" className='text-sm text-red-500 font-medium'/> 
                            </div>
                        </div>
        
                        <div className="flex my-3 gap-4">
                            <div className="flex-1">
                                <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                <Field name="city" type="text" className={inputstyle} placeholder="City"/>
                                <ErrorMessage name="city" component="p" className='text-sm text-red-500 font-medium'/> 
                            </div>
                            <div className="flex-1">
                                <label htmlFor="country" className="block text-sm font-medium text-gray-700">Country</label>
                                <Field name="country" as="select" className={inputstyle} >
                                    {listCountriesJSX}
                                </Field>
                                <ErrorMessage name="country" component="p" className='text-sm text-red-500 font-medium'/> 
                            </div>
                        </div>
        
                        <div className="flex my-3 gap-4">
                            <div className="flex-1">
                                <label htmlFor="region" className="block text-sm font-medium text-gray-700">Region</label>
                                <RegionSelect name="region" inputstyle={inputstyle} setloading={setLoading}/>
                                <ErrorMessage name="region" component="p" className='text-sm text-red-500 font-medium'/> 
                            </div>
                            <div className="flex-1">
                                <label htmlFor="postalecode" className="block text-sm font-medium text-gray-700">Postal code</label>
                                <Field name="postalcode" type="text" className={inputstyle} placeholder="Postale code"/>
                                <ErrorMessage name="postalcode" component="p" className='text-sm text-red-500 font-medium'/> 
                            </div>
                        </div>
                    </div>

                    <div className="my-3 pb-6">
                        <ShippingRadio name="shipping" setloading={setLoading} />
                        <ErrorMessage name="shipping" component="p" className='text-sm text-red-500 font-medium'/> 
                    </div>
    
    
                    <div className='my-3'>
                      <button type="submit" disabled={formik.isSubmitting} className={`w-full flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-indigo-700`}>
                          Proceed to payment
                      </button>
                    </div>
    
                </Form>
            )}
        </Formik>


    );
}