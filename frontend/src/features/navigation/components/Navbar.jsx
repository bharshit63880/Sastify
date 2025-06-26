import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { Link, useNavigate } from 'react-router-dom';
import { Badge, Button,Stack, useMediaQuery, useTheme } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { selectUserInfo } from '../../user/UserSlice';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import { selectCartItems } from '../../cart/CartSlice';
import { selectLoggedInUser } from '../../auth/AuthSlice';
import { selectWishlistItems } from '../../wishlist/WishlistSlice';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import TuneIcon from '@mui/icons-material/Tune';
import { selectProductIsFilterOpen, toggleFilters } from '../../products/ProductSlice';
import { motion } from 'framer-motion'



export const Navbar=({isProductList=false})=> {
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const userInfo=useSelector(selectUserInfo)
  const cartItems=useSelector(selectCartItems)
  const loggedInUser=useSelector(selectLoggedInUser)
  const navigate=useNavigate()
  const dispatch=useDispatch()
  const theme=useTheme()
  const is480=useMediaQuery(theme.breakpoints.down(480))

  const wishlistItems=useSelector(selectWishlistItems)
  const isProductFilterOpen=useSelector(selectProductIsFilterOpen)

  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleToggleFilters=()=>{
    dispatch(toggleFilters())
  }

  const settings = [
    {name:"Home",to:"/"},
    {name:'Profile',to:loggedInUser?.isAdmin?"/admin/profile":"/profile"},
    {name:loggedInUser?.isAdmin?'Orders':'My orders',to:loggedInUser?.isAdmin?"/admin/orders":"/orders"},
    {name:'Logout',to:"/logout"},
  ];

  return (
    <AppBar position="sticky" sx={{
      background: "rgba(255,255,255,0.85)",
      boxShadow: "0 2px 16px 0 rgba(107,70,193,0.08)",
      color: "text.primary",
      borderRadius: "0 0 32px 32px"
    }}>
      <Toolbar sx={{p:1,height:"4rem",display:"flex",justifyContent:"space-around"}}>

        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
          <Typography variant="h4" noWrap component={Link} to="/" sx={{
            mr: 2, fontWeight: 900, letterSpacing: '.3rem',
            background: 'linear-gradient(90deg, #6B46C1, #FFB6B9)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none',
            fontSize: { xs: '1.5rem', md: '2.2rem' }
          }}>
            Sastify
          </Typography>
        </motion.div>

        <Stack flexDirection={'row'} alignItems={'center'} justifyContent={'center'} columnGap={2}>
          {/* Animated Profile Avatar */}
          <Tooltip title="Open settings">
            <motion.div
              whileHover={{ scale: 1.13, rotate: 6, boxShadow: "0 0 0 4px #927bf5" }}
              whileTap={{ scale: 0.97 }}
              style={{
                borderRadius: "50%",
                background: "linear-gradient(135deg, #6B46C1 60%, #FFB6B9 100%)",
                padding: 3,
                boxShadow: "0 2px 12px 0 rgba(107,70,193,0.10)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "box-shadow 0.2s"
              }}
            >
              <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                <motion.div
                  animate={{ rotate: [0, 360, 0] }}
                  transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
                  style={{
                    borderRadius: "50%",
                    background: "white",
                    padding: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  <Avatar
                    alt={userInfo?.name}
                    src={userInfo?.avatarUrl || null}
                    sx={{
                      width: 40,
                      height: 40,
                      border: "2px solid #927bf5",
                      boxShadow: "0 2px 8px 0 rgba(107,70,193,0.10)",
                      fontWeight: 700,
                      color: "#6B46C1",
                      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)"
                    }}
                  >
                    {userInfo?.name?.[0]?.toUpperCase() || "U"}
                  </Avatar>
                </motion.div>
              </IconButton>
            </motion.div>
          </Tooltip>
          <Menu
            sx={{ mt: '45px' }}
            id="menu-appbar"
            anchorEl={anchorElUser}
            anchorOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
          >

              {
                loggedInUser?.isAdmin && 
              
                <MenuItem  onClick={handleCloseUserMenu}>
                  <Typography component={Link} color={'text.primary'} sx={{textDecoration:"none"}} to="/admin/add-product" textAlign="center">Add new Product</Typography>
                </MenuItem>
              
              }
              {settings.map((setting) => (
                <MenuItem key={setting} onClick={handleCloseUserMenu}>
                  <Typography component={Link} color={'text.primary'} sx={{textDecoration:"none"}} to={setting.to} textAlign="center">{setting.name}</Typography>
                </MenuItem>
              ))}
            </Menu>
            <Typography variant='h6' fontWeight={300}>{is480?`${userInfo?.name.toString().split(" ")[0]}`:`Welcome, ${userInfo?.name}`}</Typography>
            {loggedInUser.isAdmin && <Button variant='contained'>Admin</Button>}
            <Stack sx={{flexDirection:"row",columnGap:"1rem",alignItems:"center",justifyContent:"center"}}>

            
            {
            cartItems?.length>0 && 
            <Badge  badgeContent={cartItems.length} color='error'>
              <IconButton onClick={()=>navigate("/cart")}>
                <ShoppingCartOutlinedIcon />
                </IconButton>
            </Badge>
            }
            
            {
              !loggedInUser?.isAdmin &&
                  <Stack>
                      <Badge badgeContent={wishlistItems?.length} color='error'>
                          <IconButton component={Link} to={"/wishlist"}><FavoriteBorderIcon /></IconButton>
                      </Badge>
                  </Stack>
            }
            {
              isProductList && <IconButton onClick={handleToggleFilters}><TuneIcon sx={{color:isProductFilterOpen?"black":""}}/></IconButton>
            }
            
            </Stack>
          </Stack>
        </Toolbar>
    </AppBar>
  );
}