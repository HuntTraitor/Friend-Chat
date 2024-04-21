import { render, screen,  waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node';


import  {Confirmation}  from '../../src/views/Confirmation'
import { LoginContext } from '@/context/Login';
import { FriendsContext } from '@/context/Friends';

const mockConfirmation = {

}
const open = true
const setOpen = () => {}
const title = 'Test Title'
const content = 'Test Content'
it('Renders Confirmation correctly', async() => {
  let accepted = false;
  const trigger = () => {
    accepted = true;
  }
  render(<Confirmation open={true} setOpen={setOpen} title={title} content={content} trigger={trigger}/>)
  await screen.findByText('Test Title')
  await screen.findByText('Test Content')
  await screen.findByText('Agree')
  await screen.findByText('Disagree')
})

it('Clicks confirm', async() => {
  let accepted = false;
  const trigger = () => {
    accepted = true;
  }
  render(<Confirmation open={true} setOpen={setOpen} title={title} content={content} trigger={trigger}/>)
  fireEvent.click(screen.getByText('Agree'))
  await waitFor(() => {
    expect(accepted).toBeTruthy()
  })
})

it('Clicks Deny', async() => {
  let accepted = false;
  const trigger = () => {
    accepted = true;
  }
  render(<Confirmation open={true} setOpen={setOpen} title={title} content={content} trigger={trigger}/>)
  fireEvent.click(screen.getByText('Disagree'))
  await waitFor(() => {
    expect(accepted).toBeFalsy()
  })
})