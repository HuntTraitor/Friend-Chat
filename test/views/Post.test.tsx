import { render, screen,  waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node';


import  FriendCard  from '../../src/views/Friends/FriendCard'
import { LoginContext } from '@/context/Login';
import { Post } from '../../src/views/subcomponents/Post';

const mockPost = {
  id: "Some Id",
  member: {
    id: "Member Id",
    name: "Member Name"
  },
  posted: '',
  content: "Test content",
  image: "https://testimage.com"
}

it('Successfully renders post', async() => {
  mockPost.posted = new Date().toISOString()
  render(<Post post={mockPost}/>)
  expect(screen.findByText('Member Name')).toBeDefined()
  expect(screen.findByText('Test content')).toBeDefined()
})

it('Test datetime 1 TODAY', async() => {
  mockPost.posted = new Date(2024, 3, 12, 16, 55).toISOString()
  render(<Post post={mockPost}/>)
  expect(screen.findByText('Member Name')).toBeDefined()
  expect(screen.findByText('Test content')).toBeDefined()
})

it('Test datetime 2 AM', async() => {
  mockPost.posted = new Date(2024, 3, 12, 9, 30).toISOString()
  render(<Post post={mockPost}/>)
  expect(screen.findByText('Member Name')).toBeDefined()
  expect(screen.findByText('Test content')).toBeDefined()
})

it('Test datetime 2 PM', async() => {
  mockPost.posted = new Date(2024, 3, 12, 15, 45).toISOString()
  render(<Post post={mockPost}/>)
  expect(screen.findByText('Member Name')).toBeDefined()
  expect(screen.findByText('Test content')).toBeDefined()
})

it('Test datetime 12 to 0', async() => {
  mockPost.posted = new Date(2024, 3, 12, 0, 30).toISOString()
  render(<Post post={mockPost}/>)
  expect(screen.findByText('Member Name')).toBeDefined()
  expect(screen.findByText('Test content')).toBeDefined()
})