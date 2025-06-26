import { FormHelperText, Paper, Stack, Typography, useMediaQuery, useTheme} from '@mui/material'
import { useNavigate } from 'react-router-dom'
import FavoriteBorder from '@mui/icons-material/FavoriteBorder';
import Favorite from '@mui/icons-material/Favorite';
import Checkbox from '@mui/material/Checkbox';
import { useDispatch, useSelector } from 'react-redux';
import { selectWishlistItems } from '../../wishlist/WishlistSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { addToCartAsync,selectCartItems } from '../../cart/CartSlice';
import {motion} from 'framer-motion'
import { formatPrice } from '../../../utils/currencyFormatter';
import React from 'react';
import { Card, CardContent, CardMedia, Button, Box } from '@mui/material';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

export const ProductCard = ({id,title,price,thumbnail,brand,stockQuantity,handleAddRemoveFromWishlist,isWishlistCard,isAdminCard}) => {


    const navigate=useNavigate()
    const wishlistItems=useSelector(selectWishlistItems)
    const loggedInUser=useSelector(selectLoggedInUser)
    const cartItems=useSelector(selectCartItems)
    const dispatch=useDispatch()
    let isProductAlreadyinWishlist=-1


    const theme=useTheme()
    const is1410=useMediaQuery(theme.breakpoints.down(1410))
    const is932=useMediaQuery(theme.breakpoints.down(932))
    const is752=useMediaQuery(theme.breakpoints.down(752))
    const is500=useMediaQuery(theme.breakpoints.down(500))
    const is608=useMediaQuery(theme.breakpoints.down(608))
    const is488=useMediaQuery(theme.breakpoints.down(488))
    const is408=useMediaQuery(theme.breakpoints.down(408))

    isProductAlreadyinWishlist=wishlistItems.some((item)=>item.product._id===id)

    const isProductAlreadyInCart=cartItems.some((item)=>item.product._id===id)

    const handleAddToCart=async(e)=>{
        e.stopPropagation()
        const data={user:loggedInUser?._id,product:id}
        dispatch(addToCartAsync(data))
    }


  return (
    <motion.div
      whileHover={{ scale: 1.04, boxShadow: '0 8px 32px 0 rgba(107,70,193,0.18)' }}
      transition={{ type: 'spring', stiffness: 300 }}
      style={{ borderRadius: 24, overflow: 'hidden', background: 'rgba(255,255,255,0.85)', boxShadow: '0 2px 16px 0 rgba(107,70,193,0.08)', margin: 8 }}
      onClick={()=>navigate(`/product-details/${id}`)}
    >
      <Card sx={{ borderRadius: 4, background: 'transparent', boxShadow: 'none', minWidth: 240, maxWidth: 300 }}>
        <Box sx={{ position: 'relative', overflow: 'visible', p: 2 }}>
          <motion.div
            whileHover={{ y: -10, scale: 1.07 }}
            transition={{ type: 'spring', stiffness: 200 }}
            style={{ borderRadius: 16, background: '#fff', boxShadow: '0 2px 12px 0 rgba(107,70,193,0.10)' }}
          >
            <CardMedia
              component="img"
              height="180"
              image={thumbnail}
              alt={title}
              sx={{ objectFit: 'contain', borderRadius: 3, p: 1, background: 'rgba(245,247,250,0.7)' }}
            />
          </motion.div>
        </Box>
        <CardContent sx={{ textAlign: 'center', p: 2 }}>
          <Typography gutterBottom variant="h6" component="div" fontWeight={700} sx={{
            background: 'linear-gradient(90deg, #6B46C1, #FFB6B9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            mb: 1
          }}>
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            {brand}
          </Typography>
          <Typography variant="h6" color="primary" fontWeight={700}>
            ₹{formatPrice(price)}
          </Typography>
          <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.97 }} style={{ marginTop: 16 }}>
            <Button
              variant="contained"
              startIcon={<ShoppingCartIcon />}
              onClick={(e) => { e.stopPropagation(); handleAddToCart(e); }}
              sx={{
                borderRadius: 3,
                background: 'linear-gradient(90deg, #6B46C1, #FFB6B9)',
                fontWeight: 700,
                textTransform: 'none',
                boxShadow: '0 4px 15px rgba(107, 70, 193, 0.13)',
                '&:hover': {
                  background: 'linear-gradient(90deg, #5a3ba3, #ffb6b9)',
                },
              }}
            >
              Add to Cart
            </Button>
          </motion.div>
          {/* Wishlist icon */}
          {!isAdminCard && (
            <motion.div whileHover={{scale:1.3,y:-10,zIndex:100}} whileTap={{scale:1}} transition={{duration:.4,type:"spring"}} style={{position:'absolute',top:10,right:10}}>
              <Checkbox onClick={(e)=>e.stopPropagation()} checked={isProductAlreadyinWishlist} onChange={(e)=>handleAddRemoveFromWishlist(e,id)} icon={<FavoriteBorder />} checkedIcon={<Favorite sx={{color:'red'}} />} />
            </motion.div>
          )}
          {/* Stock warning */}
          {stockQuantity<=20 && (
            <FormHelperText sx={{fontSize:'.9rem'}} error>{stockQuantity===1?"Only 1 stock is left":"Only few are left"}</FormHelperText>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
