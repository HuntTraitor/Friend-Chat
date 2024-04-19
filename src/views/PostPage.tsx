import * as React from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import { LoginContext } from '@/context/Login';
import {Post} from './subcomponents/Post'
import { AppBar, Box, Paper, Toolbar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SendIcon from '@mui/icons-material/Send';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import { FriendsContext } from '@/context/Friends';

const fetchPosts = (setPosts: Function, setError: Function, accessToken: string) => {
  const query = {query: `query post { post(page: 1 size: 20) {id member {id name} posted content image}}`}
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
  const [posts, setPosts] = React.useState<any[]>([])
  const [error, setError] = React.useState('Logged out')
  const {friends, setFriends} = React.useContext(FriendsContext)




  const [messageInput, setMessageInput] = React.useState('');
  const handleInputChange = (event: any) => {
    setMessageInput(event.target.value);
  };

  React.useEffect(() => {
    fetchPosts(setPosts, setError, loginContext.accessToken);
  }, [loginContext.accessToken, friends])

  React.useEffect(() => {
    if (error === "Access denied! You don't have permission for this action!") {
      loginContext.setAccessToken('')
      localStorage.removeItem('accessToken')
    }
  }, [error])

  const onSubmit = (event: any) => {
    event.preventDefault();
    const query = {query: `mutation makePost{makePost(input: {
      content: "${messageInput}"
    }) {
      id member {id name} posted content image
    }}`}

    fetch('/api/graphql', {
      method: 'POST',
      body: JSON.stringify(query),
      headers: {
        'Authorization': `Bearer ${loginContext.accessToken}`,
        'Content-Type': 'application/json'
      },
    })
      .then((res) => {
        return res.json()
      })
      .then((json) => {
        if (json.errors) {
          console.log(json.errors)
          setError(`${json.errors[0].message}`)
        } else {
          setError('')
          console.log(json.data)
          setPosts([json.data.makePost, ...posts])
          setMessageInput('')
        }
      })
  }


  //auto scrolling
  const messagesEndRef = React.useRef<null | HTMLDivElement>(null)
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({})
  }
  React.useEffect(() => {
    scrollToBottom()
  }, [posts]);

  return (
    <React.Fragment>
      <div ref={messagesEndRef} />
      <Paper elevation={0}
        sx={{pt: '65px', overflowY: 'auto',  maxHeight: 'calc(100vh - 110px)'}}
      >
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {posts && 
          posts.map((post: any, index) => (
            <ListItem key={post.id} alignItems="flex-start">
              <Post post={post} />
            </ListItem>
          ))}
      </List>
    </Paper>
    <AppBar
    position="fixed"
    sx={{
      top: 'auto', 
      bottom: 0, 
      backgroundColor: 'white', 
      mb: '55px',
      border: '1px solid #ccc',
    }}
    component="form"
    onSubmit={onSubmit}
    elevation={0}
    >
      <Toolbar>
        <IconButton sx={{p: '10px'}} aria-label="menu">
          <MenuIcon />
        </IconButton>
        <InputBase
          sx={{ml: 1, flex: 1}}
          placeholder={`Message here`}
          inputProps={{'aria-label': 'message input', 'name': 'content'}}
          value={messageInput}
          onChange={handleInputChange}
        />
        <Divider sx={{height: 28, m: 0.5}} orientation="vertical" />
        <IconButton color="primary"
          sx={{p: '10px', color: 'purple'}}
          aria-label="send"
          type="submit"
          >
          <SendIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  </React.Fragment>
  );
}