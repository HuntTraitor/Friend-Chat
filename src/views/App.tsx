/*
#######################################################################
#
# Copyright (C) 2022-2024 David C. Harrison. All right reserved.
#
# You may not use, distribute, publish, or modify this code without 
# the express written permission of the copyright holder.
#
#######################################################################
*/

/*
 * Feel free to change this as much as you like, but don't add a default export
 */

import { Fragment } from 'react';
import { Typography } from '@mui/material';
import { LoginProvider } from '../context/Login';
import {Login} from './Login';
import { Home } from './Home';
import {ThemeProvider, createTheme } from '@mui/material';

const theme = createTheme({
  palette: {
    primary: {
      main: '#800080',
    },
    secondary: {
      main: '#800080',
    },
  },
});

export function App() {
  return (
    <ThemeProvider theme={theme}>
      <LoginProvider>
          <Login/>
          <Home />
      </LoginProvider>
    </ThemeProvider>
  );
}