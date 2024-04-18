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

import { render, screen } from '@testing-library/react'

import { App } from '../../src/views/App';

it('Renders', async () => {
  render(<App />)
  await screen.findByText('CSE187 Assignment 3')
});