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
#######################################################################
#                   DO NOT MODIFY THIS FILE
#######################################################################
*/

import Head from 'next/head'
import { Fragment } from 'react';
import { App } from '../views/App';

export default function Index() {
  return (
    <Fragment>
      <Head>
        <title>CSE187 Assignment 3</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <App/>
    </Fragment>
  )
}