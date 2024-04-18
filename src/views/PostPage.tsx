import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import { LoginContext } from '@/context/Login';
import {Post} from './subcomponents/Post'
import { Box } from '@mui/material';

const fetchPosts = (setPosts: Function, setError: Function, accessToken: string) => {
  const query = {query: `query post { post(page: 1 size: 20) {id posted content image}}`}
  fetch('/api/graphql', {
    method: 'POST',
    body: JSON.stringify(query),
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    }
  })
    .then((res) => {
      return res.json()
    })
    .then((json) => {
      if (json.errors) {
        setError(`${json.errors[0].message}`)
        setPosts([])
      } else {
        setError('')
        setPosts(json.data.post)
      }
    })
    .catch((e) => {
      setError(e.toString())
      alert(e.toString())
    })
}

export default function PostPage() {
  const loginContext = React.useContext(LoginContext)
  const [posts, setPosts] = React.useState([])
  const [error, setError] = React.useState('Logged out')

  React.useEffect(() => {
    fetchPosts(setPosts, setError, loginContext.accessToken);
  }, [loginContext.accessToken])


  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {posts && 
        posts.map((post: any, index) => (
          <ListItem key={post.id} alignItems="flex-start">
            <Post post={post} />
          </ListItem>
        ))}
    </List>
  );
}