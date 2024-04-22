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
import { FriendList } from './Friends/FriendList';
import { RefetchContext } from '@/context/Refetch';

interface Friend {
  id: string;
  name: string;
}

const fetchPosts = (setPosts: Function, setError: Function, accessToken: string, loginContext: any) => {
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

export default function PostPage({openFriends, setOpenFriends}: any) {
  const loginContext = React.useContext(LoginContext)
  const [posts, setPosts] = React.useState<any[]>([])
  const [error, setError] = React.useState('Logged out')
  const {refetch, setRefetch} = React.useContext(RefetchContext)

  // const [openFriends, setOpenFriends] = React.useState(false)

  const [messageInput, setMessageInput] = React.useState('');
  const handleInputChange = (event: any) => {
    setMessageInput(event.target.value);
  };

  React.useEffect(() => {
    fetchPosts(setPosts, setError, loginContext.accessToken, loginContext);
    setRefetch(false)
  }, [loginContext.accessToken, refetch])

  const onSubmit = (event: any) => {
    event.preventDefault();

    //seperate messageInput to iamge based on regex

    const re = /https?:\/\/(?:www\.)?[\w-]+\.[\w./?=&#-]*/g;
    const image = messageInput.match(re)
    let replacedContent = undefined;
    let imageString = ''
    if (image !== null) {
      replacedContent = messageInput.replace(image[0], '')
      imageString = `, image: "${image[0]}"`;
    }



    const query = {query: `mutation makePost{makePost(input: {
      content: "${replacedContent ? replacedContent: messageInput}"
      ${imageString}
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
          if(json.errors[0].message === "Access denied! You don't have permission for this action!") {
            loginContext.setAccessToken('')
            localStorage.removeItem('accessToken')
          }
          setError(`${json.errors[0].message}`)
        } else {
          setError('')
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
          <SendIcon aria-label="send post"/>
        </IconButton>
      </Toolbar>
    </AppBar>
    <FriendList openFriends={openFriends} setOpenFriends={setOpenFriends}/>
  </React.Fragment>
  );
}