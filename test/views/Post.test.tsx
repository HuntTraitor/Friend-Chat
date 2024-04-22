import { render, screen,  waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { graphql, HttpResponse } from 'msw'
import { setupServer } from 'msw/node';


import  FriendCard  from '../../src/views/Friends/FriendCard'
import { LoginContext } from '@/context/Login';
import { FriendsContext } from '@/context/Friends';
import { Post } from '../../src/views/subcomponents/Post';

const mockPost = {
  id: "Some Id",
  member: {
    id: "Member Id",
    name: "Member Name"
  },
  posted: new Date().toISOString(),
  content: "Test content",
  image: "https://testimage.com"
}

it('Successfully renders post', async() => {
  render(<Post post={mockPost}/>)
  expect(screen.findByText('Member Name')).toBeDefined()
  expect(screen.findByText('Test content')).toBeDefined()
})