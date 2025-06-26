import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useParams } from 'react-router-dom'
import { clearSelectedProduct, fetchProductByIdAsync, resetProductFetchStatus, selectProductFetchStatus, selectSelectedProduct } from '../ProductSlice'
import { Box,Checkbox,Rating, Stack,Typography, useMediaQuery,Button} from '@mui/material'
import { addToCartAsync, resetCartItemAddStatus, selectCartItemAddStatus, selectCartItems } from '../../cart/CartSlice'
import { selectLoggedInUser } from '../../auth/AuthSlice'
import { fetchReviewsByProductIdAsync,resetReviewFetchStatus,selectReviewFetchStatus,selectReviews,} from '../../review/ReviewSlice'
import { Reviews } from '../../review/components/Reviews'
import {toast} from 'react-toastify'
import {MotionConfig, motion, AnimatePresence} from 'framer-motion'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import CachedOutlinedIcon from '@mui/icons-material/CachedOutlined';
import Favorite from '@mui/icons-material/Favorite'
import { createWishlistItemAsync, deleteWishlistItemByIdAsync, resetWishlistItemAddStatus, resetWishlistItemDeleteStatus, selectWishlistItemAddStatus, selectWishlistItemDeleteStatus, selectWishlistItems } from '../../wishlist/WishlistSlice'
import { useTheme } from '@mui/material'
import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import SwipeableViews from 'react-swipeable-views-react-18-fix';
import { autoPlay } from 'react-swipeable-views-utils-react-18-fix';
import MobileStepper from '@mui/material/MobileStepper';
import Lottie from 'lottie-react'
import {loadingAnimation} from '../../../assets'
import { formatPrice } from '../../../utils/currencyFormatter';

const SIZES=['XS','S','M','L','XL']
const COLORS=['#020202','#F6F6F6','#B82222','#BEA9A9','#E2BB8D']
const AutoPlaySwipeableViews = autoPlay(SwipeableViews);

export const ProductDetails = () => {
    const {id}=useParams()
    const product=useSelector(selectSelectedProduct)
    const loggedInUser=useSelector(selectLoggedInUser)
    const dispatch=useDispatch()
    const cartItems=useSelector(selectCartItems)
    const cartItemAddStatus=useSelector(selectCartItemAddStatus)
    const [quantity,setQuantity]=useState(1)
    const [selectedSize,setSelectedSize]=useState('')
    const [selectedColorIndex,setSelectedColorIndex]=useState(-1)
    const reviews=useSelector(selectReviews)
    const [selectedImageIndex,setSelectedImageIndex]=useState(0)
    const theme=useTheme()
    const is1420=useMediaQuery(theme.breakpoints.down(1420))
    const is990=useMediaQuery(theme.breakpoints.down(990))
    const is840=useMediaQuery(theme.breakpoints.down(840))
    const is500=useMediaQuery(theme.breakpoints.down(500))
    const is480=useMediaQuery(theme.breakpoints.down(480))
    const is387=useMediaQuery(theme.breakpoints.down(387))
    const is340=useMediaQuery(theme.breakpoints.down(340))

    const wishlistItems=useSelector(selectWishlistItems)



    const isProductAlreadyInCart=cartItems.some((item)=>item.product._id===id)
    const isProductAlreadyinWishlist=wishlistItems.some((item)=>item.product._id===id)

    const productFetchStatus=useSelector(selectProductFetchStatus)
    const reviewFetchStatus=useSelector(selectReviewFetchStatus)

    const totalReviewRating=reviews.reduce((acc,review)=>acc+review.rating,0)
    const totalReviews=reviews.length
    const averageRating=parseInt(Math.ceil(totalReviewRating/totalReviews))

    const wishlistItemAddStatus=useSelector(selectWishlistItemAddStatus)
    const wishlistItemDeleteStatus=useSelector(selectWishlistItemDeleteStatus)
    
    useEffect(()=>{
        window.scrollTo({
            top:0,
            behavior:"instant"
        })
    },[])
    
    useEffect(()=>{
        if(id){
            dispatch(fetchProductByIdAsync(id))
            dispatch(fetchReviewsByProductIdAsync(id))
        }
    },[id])

    useEffect(()=>{

        if(cartItemAddStatus==='fulfilled'){
            toast.success("Product added to cart")
        }

        else if(cartItemAddStatus==='rejected'){
            toast.error('Error adding product to cart, please try again later')
        }
    },[cartItemAddStatus])

    useEffect(()=>{
        if(wishlistItemAddStatus==='fulfilled'){
            toast.success("Product added to wishlist")
        }
        else if(wishlistItemAddStatus==='rejected'){
            toast.error("Error adding product to wishlist, please try again later")
        }
    },[wishlistItemAddStatus])

    useEffect(()=>{
        if(wishlistItemDeleteStatus==='fulfilled'){
            toast.success("Product removed from wishlist")
        }
        else if(wishlistItemDeleteStatus==='rejected'){
            toast.error("Error removing product from wishlist, please try again later")
        }
    },[wishlistItemDeleteStatus])

    useEffect(()=>{
        if(productFetchStatus==='rejected'){
            toast.error("Error fetching product details, please try again later")
        }
    },[productFetchStatus])

    useEffect(()=>{
        if(reviewFetchStatus==='rejected'){
            toast.error("Error fetching product reviews, please try again later")
        }
    },[reviewFetchStatus])

    useEffect(()=>{
        return ()=>{
            dispatch(clearSelectedProduct())
            dispatch(resetProductFetchStatus())
            dispatch(resetReviewFetchStatus())
            dispatch(resetWishlistItemDeleteStatus())
            dispatch(resetWishlistItemAddStatus())
            dispatch(resetCartItemAddStatus())
        }
    },[])

    const handleAddToCart=()=>{
        const item={user:loggedInUser._id,product:id,quantity}
        dispatch(addToCartAsync(item))
        setQuantity(1)
    }

    const handleDecreaseQty=()=>{
        if(quantity!==1){
            setQuantity(quantity-1)
        }
    }
    
    const handleIncreaseQty=()=>{
        if(quantity<20 && quantity<product.stockQuantity){
            setQuantity(quantity+1)
        }
    }

    const handleSizeSelect=(size)=>{
        setSelectedSize(size)
    }

    const handleAddRemoveFromWishlist=(e)=>{
        if(e.target.checked){
            const data={user:loggedInUser?._id,product:id}
            dispatch(createWishlistItemAsync(data))
        }

        else if(!e.target.checked){
            const index=wishlistItems.findIndex((item)=>item.product._id===id)
            dispatch(deleteWishlistItemByIdAsync(wishlistItems[index]._id));
        }
    }

    const [activeStep, setActiveStep] = React.useState(0);
    const maxSteps = product?.images.length;

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleStepChange = (step) => {
        setActiveStep(step);
    };
    

  return (
    <>
    <AnimatePresence>
    {!(productFetchStatus==='rejected' && reviewFetchStatus==='rejected') && (
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        transition={{ duration: 0.7, type: "spring" }}
        style={{ width: "100%" }}
      >
      <Stack sx={{justifyContent:'center',alignItems:'center',mb:'2rem',rowGap:"2rem"}}>
        {
            (productFetchStatus || reviewFetchStatus) === 'pending'?
            <Stack width={is500?"35vh":'25rem'} height={'calc(100vh - 4rem)'} justifyContent={'center'} alignItems={'center'}>
                <Lottie animationData={loadingAnimation}/>
            </Stack>
            :
            <motion.div
              initial={{ boxShadow: "0 8px 32px 0 rgba(107,70,193,0.10)", scale: 0.98 }}
              animate={{ boxShadow: "0 16px 48px 0 rgba(107,70,193,0.18)", scale: 1, y: [0, -8, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
              style={{
                background: "rgba(255,255,255,0.95)",
                borderRadius: 32,
                padding: is480 ? 8 : 32,
                marginTop: is840 ? 0 : 40,
                marginBottom: 40,
                minWidth: is480 ? "98vw" : is1420 ? "90vw" : "88rem",
                maxWidth: "98vw"
              }}
            >
            <Stack width={is480?"auto":is1420?"auto":'88rem'} p={is480?2:0} height={is840?"auto":"50rem"} rowGap={5} mt={is840?0:5} justifyContent={'center'} mb={5} flexDirection={is840?"column":"row"} columnGap={is990?"2rem":"5rem"}>
                {/* left stack (images) */}
                <Stack sx={{flexDirection:"row",columnGap:"2.5rem",alignSelf:"flex-start",height:"100%"}}>
                    {/* image selection */}
                    {!is1420 && <Stack sx={{display:"flex",rowGap:'1.5rem',height:"100%",overflowY:"scroll"}}>
                        {product && product.images.map((image,index)=>(
                            <motion.div
                              whileHover={{ scale: 1.08, boxShadow: "0 4px 16px 0 #927bf5" }}
                              whileTap={{ scale: 0.97 }}
                              style={{width:"200px",cursor:"pointer",borderRadius:16,overflow:"hidden",border: selectedImageIndex===index ? "2px solid #6B46C1" : "2px solid transparent"}}
                              onClick={()=>setSelectedImageIndex(index)}
                              key={index}
                            >
                                <img style={{width:"100%",objectFit:"contain"}} src={image} alt={`${product.title} image`} />
                            </motion.div>
                        ))}
                    </Stack>}
                    {/* selected image */}
                    <Stack mt={is480?"0rem":'5rem'}>
                        <AnimatePresence mode="wait">
                        {is1420?
                        <Stack width={is480?"100%":is990?'400px':"500px"}>
                            <AutoPlaySwipeableViews width={'100%'} height={'100%'} axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={activeStep} onChangeIndex={handleStepChange} enableMouseEvents >
                                {product?.images.map((image,index) => (
                                <motion.div
                                  key={index}
                                  initial={{ opacity: 0, scale: 0.95 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  exit={{ opacity: 0, scale: 0.95 }}
                                  transition={{ duration: 0.4 }}
                                  style={{width:"100%",height:'100%'}}
                                >
                                    {Math.abs(activeStep - index) <= 2 
                                        ?
                                        <Box component="img" sx={{width:'100%',objectFit:"contain",overflow:"hidden",aspectRatio:1/1, borderRadius: 24}} src={image} alt={product?.title} />
                                        :
                                        null
                                    }
                                </motion.div>
                                ))}
                            </AutoPlaySwipeableViews>
                            <MobileStepper steps={maxSteps} position="static" activeStep={activeStep}
                              nextButton={<Button size="small" onClick={handleNext} disabled={activeStep === maxSteps - 1} >Next{theme.direction === 'rtl' ? (<KeyboardArrowLeft />) : (<KeyboardArrowRight />)}</Button>}
                              backButton={<Button size="small" onClick={handleBack} disabled={activeStep === 0}>{theme.direction === 'rtl' ? (<KeyboardArrowRight />) : (<KeyboardArrowLeft />)}Back</Button>}
                            />
                        </Stack>
                        :
                        <motion.div
                          key={selectedImageIndex}
                          initial={{ opacity: 0, scale: 0.97, y: 20 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.97, y: 20 }}
                          transition={{ duration: 0.5 }}
                          style={{width:"100%",borderRadius:24,overflow:"hidden",boxShadow:"0 4px 24px 0 #927bf5"}}
                        >
                            <img style={{width:"100%",objectFit:"contain",aspectRatio:1/1}} src={product?.images[selectedImageIndex]} alt={`${product?.title} image`} />
                        </motion.div>
                        }
                        </AnimatePresence>
                    </Stack>
                </Stack>
                {/* right stack - about product */}
                <Stack rowGap={"1.5rem"} width={is480?"100%":'25rem'}>
                    {/* title rating price */}
                    <Stack rowGap={".5rem"}>
                        {/* title */}
                        <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                          <Typography variant='h4' fontWeight={700} sx={{
                            background: "linear-gradient(90deg, #6B46C1, #FFB6B9)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                          }}>{product?.title}</Typography>
                        </motion.div>
                        {/* rating */}
                        <Stack sx={{flexDirection:"row",columnGap:is340?".5rem":"1rem",alignItems:"center",flexWrap:'wrap',rowGap:'1rem'}}>
                            <Rating value={averageRating} readOnly/>
                            <Typography>( {totalReviews===0?"No reviews":totalReviews===1?`${totalReviews} Review`:`${totalReviews} Reviews`} )</Typography>
                            <Typography color={product?.stockQuantity<=10?"error":product?.stockQuantity<=20?"orange":"green"}>{product?.stockQuantity<=10?`Only ${product?.stockQuantity} left`:product?.stockQuantity<=20?"Only few left":"In Stock"}</Typography>
                        </Stack>
                        {/* price */}
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.3 }}>
                          <Typography variant='h5' sx={{
                            fontWeight: 700,
                            color: "#6B46C1",
                            letterSpacing: ".03em"
                          }}>{formatPrice(product?.price)}</Typography>
                        </motion.div>
                    </Stack>
                    {/* description */}
                    <Stack rowGap={".8rem"}>
                        <Typography>{product?.description}</Typography>
                        <hr />
                    </Stack>
                    {/* color, size and add-to-cart */}
                    {!loggedInUser?.isAdmin &&
                    <Stack sx={{rowGap:"1.3rem"}} width={'fit-content'}>
                        {/* colors */}
                        <Stack flexDirection={'row'} alignItems={'center'} columnGap={is387?'5px':'1rem'} width={'fit-content'}>
                            <Typography>Colors: </Typography>
                            <Stack flexDirection={'row'} columnGap={is387?".5rem":".2rem"}>
                                {COLORS.map((color,index)=>(
                                    <motion.div
                                      whileHover={{ scale: 1.15, boxShadow: "0 0 0 4px #FFB6B9" }}
                                      whileTap={{ scale: 0.97 }}
                                      style={{
                                        backgroundColor:"white",
                                        border:selectedColorIndex===index?`2px solid #6B46C1`:"2px solid #eee",
                                        width:is340?"40px":"50px",
                                        height:is340?"40px":"50px",
                                        display:"flex",
                                        justifyContent:"center",
                                        alignItems:"center",
                                        borderRadius:"100%",
                                        cursor:"pointer",
                                        transition:"border 0.2s"
                                      }}
                                      onClick={()=>setSelectedColorIndex(index)}
                                      key={index}
                                    >
                                        <div style={{
                                          width:"40px",
                                          height:"40px",
                                          border:color==='#F6F6F6'?"1px solid #bbb":"none",
                                          backgroundColor:color,
                                          borderRadius:"100%"
                                        }}></div>
                                    </motion.div>
                                ))}
                            </Stack>
                        </Stack>
                        {/* size */}
                        <Stack flexDirection={'row'} alignItems={'center'} columnGap={is387?'5px':'1rem'} width={'fit-content'}>
                            <Typography>Size: </Typography>
                            <Stack flexDirection={'row'} columnGap={is387?".5rem":"1rem"}>
                                {SIZES.map((size)=>(
                                    <motion.div
                                      whileHover={{ scale: 1.13, backgroundColor: "#6B46C1", color: "#fff" }}
                                      whileTap={{ scale: 0.97 }}
                                      style={{
                                        border:selectedSize===size?'2px solid #6B46C1':"1px solid #eee",
                                        borderRadius:"8px",
                                        width:"30px",
                                        height:"30px",
                                        display:"flex",
                                        justifyContent:"center",
                                        alignItems:"center",
                                        cursor:"pointer",
                                        padding:"1.2rem",
                                        backgroundColor:selectedSize===size?"#DB4444":"whitesmoke",
                                        color:selectedSize===size?"white":"",
                                        fontWeight: 600,
                                        fontSize: "1.1rem",
                                        transition:"all 0.2s"
                                      }}
                                      onClick={()=>handleSizeSelect(size)}
                                      key={size}
                                    >
                                        <p>{size}</p>
                                    </motion.div>
                                ))}
                            </Stack>
                        </Stack>
                        {/* quantity , add to cart and wishlist */}
                        <Stack flexDirection={"row"} columnGap={is387?".3rem":"1.5rem"} width={'100%'} >
                            {/* qunatity */}
                            <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'space-between'}>
                                <MotionConfig whileHover={{scale:1.050}} whileTap={{scale:1}}>
                                    <motion.button
                                      whileHover={{ backgroundColor: "#FFB6B9", color: "#fff" }}
                                      style={{
                                        padding:"10px 15px",
                                        fontSize:"1.050rem",
                                        backgroundColor:"",
                                        color:"black",
                                        outline:"none",
                                        border:'1px solid black',
                                        borderRadius:"8px",
                                        cursor:"pointer",
                                        transition:"background 0.2s"
                                      }}
                                      onClick={handleDecreaseQty}
                                    >-</motion.button>
                                    <p style={{margin:"0 1rem",fontSize:"1.1rem",fontWeight:'400'}}>{quantity}</p>
                                    <motion.button
                                      whileHover={{ backgroundColor: "#6B46C1", color: "#fff" }}
                                      style={{
                                        padding:"10px 15px",
                                        fontSize:"1.050rem",
                                        backgroundColor:"black",
                                        color:"white",
                                        outline:"none",
                                        border:'none',
                                        borderRadius:"8px",
                                        cursor:"pointer",
                                        transition:"background 0.2s"
                                      }}
                                      onClick={handleIncreaseQty}
                                    >+</motion.button>
                                </MotionConfig>
                            </Stack>
                            {/* add to cart */}
                            {isProductAlreadyInCart?
                                <motion.button
                                  whileHover={{ scale: 1.05, backgroundColor: "#6B46C1" }}
                                  style={{
                                    padding:"10px 15px",
                                    fontSize:"1.050rem",
                                    backgroundColor:"black",
                                    color:"white",
                                    outline:"none",
                                    border:'none',
                                    borderRadius:"8px",
                                    cursor:"pointer",
                                    transition:"background 0.2s"
                                  }}
                                >In Cart</motion.button>
                                :
                                <motion.button
                                  whileHover={{ scale: 1.05, backgroundColor: "#6B46C1" }}
                                  whileTap={{ scale: 0.97 }}
                                  onClick={handleAddToCart}
                                  style={{
                                    padding:"10px 15px",
                                    fontSize:"1.050rem",
                                    backgroundColor:"black",
                                    color:"white",
                                    outline:"none",
                                    border:'none',
                                    borderRadius:"8px",
                                    cursor:"pointer",
                                    transition:"background 0.2s"
                                  }}
                                >Add To Cart</motion.button>
                            }
                            {/* wishlist */}
                            <motion.div
                              whileHover={{ scale: 1.15, boxShadow: "0 0 0 4px #FFB6B9" }}
                              style={{
                                border:"1px solid #eee",
                                borderRadius:"4px",
                                display:"flex",
                                justifyContent:"center",
                                alignItems:"center",
                                background: isProductAlreadyinWishlist ? "#FFB6B9" : "#fff",
                                transition:"background 0.2s"
                              }}
                            >
                                <Checkbox checked={isProductAlreadyinWishlist} onChange={(e)=>handleAddRemoveFromWishlist(e)} icon={<FavoriteBorder />} checkedIcon={<Favorite sx={{color:'red'}} />} />
                            </motion.div>
                        </Stack>
                    </Stack>
                    }
                    {/* product perks */}
                    <Box mt={3} sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: "center",
                      alignItems: 'center',
                      border: "1px #eee solid",
                      borderRadius: "16px",
                      background: "rgba(245,247,250,0.7)",
                      boxShadow: "0 2px 16px 0 rgba(107,70,193,0.05)"
                    }}>
                        <Stack p={2} flexDirection={'row'} alignItems={"center"} columnGap={'1rem'} width={'100%'} justifyContent={'flex-start'}>
                            <Box>
                                <LocalShippingOutlinedIcon/>
                            </Box>
                            <Stack>
                                <Typography>Free Delivery</Typography>
                                <Typography>Enter your postal for delivery availabity</Typography>
                            </Stack>
                        </Stack>
                        <hr style={{width:"90%"}} />
                        <Stack p={2} flexDirection={'row'} alignItems={"center"} width={'100%'} columnGap={'1rem'} justifyContent={'flex-start'}>
                            <Box>
                                <CachedOutlinedIcon/>
                            </Box>
                            <Stack>
                                <Typography>Return Delivery</Typography>
                                <Typography>Free 30 Days Delivery Returns</Typography>
                            </Stack>
                        </Stack>
                    </Box>
                </Stack>
            </Stack>
            {/* reviews */}
            <Stack width={is1420?"auto":'88rem'} p={is480?2:0}>
                <Reviews productId={id} averageRating={averageRating}/>       
            </Stack>
            </motion.div>
        }
      </Stack>
      </motion.div>
    )}
    </AnimatePresence>
    </>
  )
}
