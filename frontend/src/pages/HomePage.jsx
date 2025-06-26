import  { useEffect } from 'react'
import { Navbar } from '../features/navigation/components/Navbar'
import { ProductList } from '../features/products/components/ProductList'
import { resetAddressStatus, selectAddressStatus } from '../features/address/AddressSlice'
import { useDispatch, useSelector } from 'react-redux'
import {Footer} from '../features/footer/Footer'
import GallerySection from '../components/GallerySection';
import BlogSection from '../components/BlogSection';

export const HomePage = () => {

  const dispatch=useDispatch()
  const addressStatus=useSelector(selectAddressStatus)

  useEffect(()=>{
    if(addressStatus==='fulfilled'){

      dispatch(resetAddressStatus())
    }
  },[addressStatus])

  return (
    <>
    <Navbar isProductList={true}/>
    <ProductList/>
    <br/>
    <br/>
    <GallerySection />
    <BlogSection />
    <Footer/>
    </>
  )
}
