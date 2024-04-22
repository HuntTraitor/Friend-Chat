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
import { LoginContext } from '@/context/Login';
import FriendCard from './FriendCard';
import { ListItem } from '@mui/material';
import {RequestCard} from './RequestCard';
import { MemberList } from '../Members/MemberList';
import { RefetchContext } from '@/context/Refetch';

interface Friend {
  id: string;
  name: string;
}

interface RequestState {
  inbound: Friend[];
  outbound: Friend[];
}

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const fetchFriends = (setFriends: Function, accessToken: string) => {
  const query = {query: `query friend{friend {id name}}`}
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
        setFriends([])
      } else {
        setFriends(json.data.friend)
      }
    })
    .catch((e: Error) => {
      alert(e.toString())
    })
}

const fetchReqeusts = (setRequests: Function, accessToken: string) => {
  const query = {query: `query request{request {
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
      setRequests([])
    } else {
      setRequests(json.data.request)
    }
  })
  .catch((e) => {
    alert(e.toString())
  })
}

export function FriendList({openFriends, setOpenFriends}: any) {



  // const {openFriends, setOpenFriends} = React.useContext(OpenFriendsContext)
  const loginContext = React.useContext(LoginContext)
  const [friends, setFriends] = React.useState<Friend[]>([])
  const [openMembers, setOpenMembers] = React.useState(false)
  const [requests, setRequests] = React.useState<RequestState>({
    inbound: [],
    outbound: []
  });

  const {refetch, setRefetch} = React.useContext(RefetchContext)
  // const {openMembers, setOpenMembers} = React.useContext(OpenMembersContext)

  React.useEffect(() => {
    fetchFriends(setFriends, loginContext.accessToken)
    fetchReqeusts(setRequests, loginContext.accessToken)
    setRefetch(false)
  }, [loginContext.accessToken, refetch])

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
              aria-label="close friends"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Friends
            </Typography>
            <Button autoFocus color="inherit" onClick={() => setOpenMembers(true)} aria-label='Add Members Button'>
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
              requests.outbound?.map((request: any) => (
                <ListItem key={request.id}>
                  <RequestCard friend={request} bound={"outbound"}/>
                </ListItem>
              ))}
              {requests &&
                requests.inbound?.map((request: any) => (
                <ListItem key={request.id}>
                  <RequestCard friend={request} bound={"inbound"}/>
                </ListItem>
              ))}
          </List>
          <MemberList openMembers={openMembers} setOpenMembers={setOpenMembers}/>
      </Dialog>
    </React.Fragment>
  );
}