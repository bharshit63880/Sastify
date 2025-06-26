import { Stack, TextField, Typography, Box, useTheme, useMediaQuery } from '@mui/material';
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { LoadingButton } from '@mui/lab';
import { selectLoggedInUser, loginAsync, selectLoginStatus, selectLoginError, clearLoginError, resetLoginStatus } from '../AuthSlice';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const bgShapes = [
  { top: '-60px', left: '-60px', size: 180, color: 'rgba(107,70,193,0.18)', delay: 0 },
  { top: '70%', left: '-80px', size: 120, color: 'rgba(255,182,185,0.18)', delay: 0.2 },
  { top: '10%', right: '-70px', size: 140, color: 'rgba(107,70,193,0.13)', delay: 0.4 },
  { bottom: '-60px', right: '-60px', size: 160, color: 'rgba(255,182,185,0.13)', delay: 0.6 },
];

export const Login = () => {
  const dispatch = useDispatch();
  const status = useSelector(selectLoginStatus);
  const error = useSelector(selectLoginError);
  const loggedInUser = useSelector(selectLoggedInUser);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const navigate = useNavigate();
  const theme = useTheme();
  const is900 = useMediaQuery(theme.breakpoints.down(900));
  const is480 = useMediaQuery(theme.breakpoints.down(480));

  // Handle user redirection
  useEffect(() => {
    if (loggedInUser) {
      navigate(loggedInUser.isVerified ? '/' : '/verify-otp');
    }
  }, [loggedInUser, navigate]);

  // Handle login error toasts
  useEffect(() => {
    if (error) {
      toast.error(error.message);
      dispatch(clearLoginError());
    }
  }, [error, dispatch]);

  // Handle login success and cleanup
  useEffect(() => {
    if (status === 'fulfilled' && loggedInUser?.isVerified) {
      toast.success('Login successful');
      reset();
    }
    return () => {
      dispatch(resetLoginStatus());
    };
  }, [status, loggedInUser, dispatch, reset]);

  // Handle login submission
  const handleLogin = (data) => {
    dispatch(loginAsync(data));
  };

  return (
    <Stack
      width="100vw"
      height="100vh"
      justifyContent="center"
      alignItems="center"
      sx={{
        background: 'linear-gradient(135deg, #e0e7ff 0%, #fce7f3 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Animated floating background shapes */}
      {bgShapes.map((shape, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.8, opacity: 0.7, y: 0 }}
          animate={{ scale: 1, opacity: 1, y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, repeatType: "reverse", delay: shape.delay }}
          style={{
            position: 'absolute',
            ...shape,
            width: shape.size,
            height: shape.size,
            borderRadius: '50%',
            background: shape.color,
            zIndex: 0,
            filter: 'blur(2px)'
          }}
        />
      ))}

      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 60, scale: 0.98 }}
          transition={{ duration: 0.7, type: "spring" }}
          style={{
            zIndex: 2,
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            position: 'relative'
          }}
        >
          <Box sx={{ position: 'relative', width: is480 ? '95vw' : '400px' }}>
            {/* Floating shapes inside the box */}
            <motion.div
              style={{
                position: 'absolute',
                top: -30,
                left: -30,
                width: 60,
                height: 60,
                borderRadius: '50%',
                background: 'rgba(107,70,193,0.13)',
                zIndex: 1,
                filter: 'blur(1px)'
              }}
              animate={{ y: [0, 10, 0], x: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity, repeatType: "reverse" }}
            />
            <motion.div
              style={{
                position: 'absolute',
                bottom: -25,
                right: -25,
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(255,182,185,0.13)',
                zIndex: 1,
                filter: 'blur(1px)'
              }}
              animate={{ y: [0, -10, 0], x: [0, -10, 0] }}
              transition={{ duration: 5, repeat: Infinity, repeatType: "reverse" }}
            />
            <Stack
              sx={{
                background: 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(16px)',
                borderRadius: 6,
                p: is480 ? 3 : 5,
                width: '100%',
                boxShadow: '0 8px 32px rgba(107, 70, 193, 0.13)',
                position: 'relative',
                overflow: 'hidden',
                alignItems: 'center',
                margin: 'auto'
              }}
              spacing={4}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Typography
                  variant="h3"
                  fontWeight={900}
                  sx={{
                    background: 'linear-gradient(90deg, #6B46C1, #FFB6B9)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    letterSpacing: '0.5px',
                    mb: 1,
                    textAlign: 'center'
                  }}
                >
                  Sastify
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    color: 'rgba(0,0,0,0.6)',
                    fontWeight: 500,
                    textAlign: 'center'
                  }}
                >
                  Welcome Back!
                </Typography>
              </motion.div>

              <Stack
                component="form"
                noValidate
                onSubmit={handleSubmit(handleLogin)}
                spacing={3}
                width="100%"
              >
                <motion.div whileFocus={{ scale: 1.03 }}>
                  <TextField
                    fullWidth
                    label="Email"
                    variant="outlined"
                    InputProps={{
                      sx: {
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.7)',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                        message: 'Enter a valid email',
                      },
                    })}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    aria-label="Email"
                  />
                </motion.div>

                <motion.div whileFocus={{ scale: 1.03 }}>
                  <TextField
                    fullWidth
                    label="Password"
                    type="password"
                    variant="outlined"
                    InputProps={{
                      sx: {
                        borderRadius: 3,
                        background: 'rgba(255,255,255,0.7)',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: theme.palette.primary.main,
                        },
                      },
                    }}
                    {...register('password', { required: 'Password is required' })}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    aria-label="Password"
                  />
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <LoadingButton
                    fullWidth
                    size="large"
                    loading={status === 'pending'}
                    type="submit"
                    variant="contained"
                    sx={{
                      py: 2,
                      borderRadius: 3,
                      textTransform: 'none',
                      fontSize: '1.1rem',
                      fontWeight: 700,
                      background: 'linear-gradient(90deg, #6B46C1, #FFB6B9)',
                      boxShadow: '0 4px 15px rgba(107, 70, 193, 0.13)',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #5a3ba3, #ffb6b9)',
                      },
                    }}
                  >
                    Sign In
                  </LoadingButton>
                </motion.div>

                <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2}>
                  <motion.div whileHover={{ x: -3 }}>
                    <Typography
                      component={Link}
                      to="/forgot-password"
                      sx={{
                        textDecoration: 'none',
                        color: 'rgba(0,0,0,0.6)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        '&:hover': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      Forgot password?
                    </Typography>
                  </motion.div>
                  <motion.div whileHover={{ x: 3 }}>
                    <Typography
                      component={Link}
                      to="/signup"
                      sx={{
                        textDecoration: 'none',
                        color: 'rgba(0,0,0,0.6)',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        '&:hover': {
                          color: theme.palette.primary.main,
                        },
                      }}
                    >
                      Sign up
                    </Typography>
                  </motion.div>
                </Stack>
              </Stack>
            </Stack>
          </Box>
        </motion.div>
      </AnimatePresence>
    </Stack>
  );
};