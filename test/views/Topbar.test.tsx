import { render, screen } from '@testing-library/react'
import  Topbar from '../../src/views/Topbar';

it('Renders topbar', async() => {
  render(<Topbar />)
  expect(screen.queryByText('Posts')).not.toBeNull()
})