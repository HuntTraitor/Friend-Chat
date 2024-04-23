import { render, screen,  waitFor, fireEvent } from '@testing-library/react'
import EmojiPicker from '@/views/EmojiPicker';

const message = 'Test'
const setMessage = () => {message + '😀'}

it('Renders emoji picker', async() => {
  render(<EmojiPicker />)
  await waitFor(() => {
    screen.getByLabelText('Emoji Button')
  })
})

it('Opens emoji list', async() => {
  render(<EmojiPicker />)
  fireEvent.click(screen.getByLabelText('Emoji Button'))
})

it('Clicks on an emoji', async() => {
  render(<EmojiPicker messageInput={message} setMessageInput={setMessage}/>)
  fireEvent.click(screen.getByLabelText('Emoji Button'))
  const emojis = screen.getAllByLabelText('emoji')
  fireEvent.click(emojis[0])
})

it('Closes Emoji List', async() => {
  render(<EmojiPicker messageInput={message} setMessageInput={setMessage}/>)
  fireEvent.click(screen.getByLabelText('Emoji Button'))
  fireEvent.click(screen.getByLabelText('Close Emoji Keyboard'));
})