import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { NavigationContext } from '@/context/Navigation';
import { OpenFriendsContext } from '@/context/OpenFriends';
import { LoginContext } from '@/context/Login';
import FriendCard from './FriendCard';
import { ListItem } from '@mui/material';
import {RequestCard} from './RequestCard';
import { FriendsContext, FriendsProvider } from '@/context/Friends';

interface FriendRequest {
  inbound: Array<{
    id: string;
    name: string;
  }>;
  outbound: Array<{
    id: string;
    name: string;
  }>; 
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const fetchFriends = (setFriends: Function, setError: Function, accessToken: string) => {
  const query = {query: `{friend {id name}}`}
  fetch('/api/graphql', {
    method: 'POST',
    body: JSON.stringify(query),
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })
    .then((res) => {
      return res.json()
    })
    .then((json) => {
      if (json.errors) {
        setError(`${json.errors[0].message}`)
        setFriends([])
      } else {
        setError('')
        setFriends(json.data.friend)
      }
    })
    .catch((e: Error) => {
      setError(e.toString())
      alert(e.toString())
    })
}

const fetchReqeusts = (setRequests: Function, setError: Function, accessToken: string) => {
  const query = {query: `{request {
    inbound {id name}
    outbound {id name}
  }}`}
  fetch('/api/graphql', {
    method: 'POST',
    body: JSON.stringify(query),
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })
  .then((res) => {
    return res.json()
  })
  .then((json) => {
    if (json.errors) {
      setError(`${json.errors[0].message}`)
      setRequests([])
    } else {
      setError('')
      setRequests(json.data.request)
    }
  })
  .catch((e) => {
    setError(e.toString())
    alert(e.toString())
  })
}

export function FriendList() {
  const {openFriends, setOpenFriends} = React.useContext(OpenFriendsContext)
  const loginContext = React.useContext(LoginContext)
  const {friends, setFriends} = React.useContext(FriendsContext)
  const [requests, setRequests] = React.useState<FriendRequest>({inbound: [], outbound: []})
  const [error, setError] = React.useState('Logged out')

  React.useEffect(() => {
    fetchFriends(setFriends, setError, loginContext.accessToken)
    fetchReqeusts(setRequests, setError, loginContext.accessToken)
  }, [loginContext.accessToken])

  React.useEffect(() => {
    if (error === "Access denied! You don't have permission for this action!") {
      loginContext.setAccessToken('')
      localStorage.removeItem('accessToken')
    }
  }, [error])

  const handleClickOpen = () => {
    setOpenFriends(true);
  };

  const handleClose = () => {
    setOpenFriends(false);
  };

  return (
    <React.Fragment>
      <Dialog
        fullScreen
        open={openFriends}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Friends
            </Typography>
            <Button autoFocus color="inherit" onClick={handleClose}>
              <PersonAddIcon />
            </Button>
          </Toolbar>
        </AppBar>
        <List>
          {friends && 
            friends.map((friend: any) => (
              <ListItem key={friend.id}>
                <FriendCard friend={friend}/>
              </ListItem>
            ))}
        </List>
        <Divider />
        <List>
          {requests &&
            requests.outbound.map((request: any) => (
              <ListItem key={request.id}>
                <RequestCard friend={request} bound={"outbound"}/>
              </ListItem>
            ))}
            {requests &&
              requests.inbound.map((request: any) => (
              <ListItem key={request.id}>
                <RequestCard friend={request} bound={"inbound"}/>
              </ListItem>
            ))}
        </List>
      </Dialog>
    </React.Fragment>
  );
}