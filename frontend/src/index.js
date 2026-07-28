import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import {Provider} from 'react-redux'
import { store } from './app/store';
import {ToastContainer} from 'react-toastify'
import { CssBaseline, ThemeProvider as MuiThemeProvider } from '@mui/material';
import { useMemo } from 'react';
import { ThemeProvider, useThemeMode } from './theme/ThemeProvider';
import { createSastifyTheme } from './theme/theme';
import './index.css';
import 'react-toastify/dist/ReactToastify.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

const ThemedApplication = () => {
  const { resolvedTheme } = useThemeMode();
  const muiTheme = useMemo(() => createSastifyTheme(resolvedTheme), [resolvedTheme]);

  return (
    <MuiThemeProvider theme={muiTheme}>
      <CssBaseline />
      <App />
      <ToastContainer
        position="top-right"
        autoClose={2400}
        closeOnClick
        pauseOnFocusLoss
        pauseOnHover
        newestOnTop
        theme={resolvedTheme}
      />
    </MuiThemeProvider>
  );
};

root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider>
        <ThemedApplication />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
