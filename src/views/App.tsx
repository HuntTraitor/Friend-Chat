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

export function App() {
  return (
    <LoginProvider>
        <Login />
        <Home />
    </LoginProvider>
  );
}