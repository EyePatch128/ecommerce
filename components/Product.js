import Image from 'next/image';
import {stripHTML} from '../src/utils.js';
// import ColorOptions from './ColorOptions.js';
import { fetchCommerce } from "../src/utils";
import { useState, useEffect } from 'react';
import { RadioGroup } from '@headlessui/react';
// import 'tw-elements';


function classNames(...classes) {
    return classes.filter(Boolean).join(' ')
}


export default function Product({id, name, price, image}) {

  const [colors, setColors] = useState([]);
  useEffect(()=>{
      const getColors = async ()=>{
          const {data} = await (await fetchCommerce(`v1/products/${id}/variant_groups`)).json();
          const {name, options} = data.filter(elem=>elem.name == 'Color')[0];
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

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);

  const [imageUrl, setImageUrl] = useState(image.url);
  const [imageId, setImageId] = useState(image.id);

  const updateImage = async (option_id)=>{
    const color = colors.filter(elem=>elem.option_id == option_id)[0];
    const asset_id = color.color_assets[0];
    if(asset_id != imageId){
      const data = await (await fetch(`/api/asset/${asset_id}`)).json();
      setImageUrl(data.url);
      setImageId(data.id);
    }
  }

  return (
    <div className='rounded'>
      <div className='w-full aspect-square bg-slate-600 rounded'>
          <Image src={imageUrl} layout='responsive' width="150" height="150"/>
      </div>
      <div className='my-3'>
          <div className='flex justify-between gap-4'>
              <h3 className='font-semibold'>{name}</h3>
              <h3 className='font-semibold'>{price.formatted_with_symbol}</h3>
          </div>

          {colors ? 
            <div>
                {/* <ColorOptions product_colors={colors}/> */}
                <RadioGroup value={selectedColor} onChange={setSelectedColor} className="mt-4">
                    <div className="flex items-center justify-center space-x-0.5">
                        {colors.map((color) => (
                            <RadioGroup.Option
                                key={color.option_id}
                                value={color.color_name}
                                className={({ active, checked }) =>
                                    classNames(
                                    active && checked ? 'ring ring-offset-1' : '',
                                    !active && checked ? 'ring-2' : '',
                                    'ring-gray-400 -m-0.5 relative p-0.5 rounded-full flex items-center justify-center cursor-pointer focus:outline-none'
                                    )
                                }
                                onMouseOver={()=>updateImage(color.option_id)}
                            >
                        <RadioGroup.Label as="span" className="sr-only">
                            {color.color_name}
                        </RadioGroup.Label>
                        <span
                            aria-hidden="true"
                            className={classNames(
                            `bg-${color.color_value}`,
                            'h-5 w-5 border border-black border-opacity-10 rounded-full'
                            )}
                        />
                        </RadioGroup.Option>
                    ))}
                    </div>
                </RadioGroup>
            </div>
            :
            null
          }
      </div>
    </div>
  );
}