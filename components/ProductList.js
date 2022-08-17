import Link from "next/link";
import Product from "./Product";

export default function ProductList({products}) {
    if (!products){
        return(
            <p className="text-center text-gray-500">No product have been found</p>
        )
    }
    
    return (
        <ul className='list-none grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10 my-10'>
            {products.map((product) => {
                return (
                    <li key={product.permalink}>
                        <Link href={`/products/${product.permalink}`}>
                            <a>
                                <Product {...product} />
                            </a>
                        </Link>
                    </li>
                )}
            )}
        </ul>
    );
  }