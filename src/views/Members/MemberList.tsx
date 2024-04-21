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
import { ListItem } from '@mui/material';
import { FriendsContext, FriendsProvider } from '@/context/Friends';
import { RequestContext } from '@/context/Requests';
import { OpenMembersContext } from '@/context/OpenMembers';
import { MemberCard } from './MemberCard';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement;
  },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="left" ref={ref} {...props} />;
});

const fetchMembers = (setMembers: Function, accessToken: string) => {
  const query = {query: `query nonFriendMember{nonFriendMember {id name}}`}
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
      console.error(json.errors)
      setMembers([])
    } else {
      setMembers(json.data.nonFriendMember)
    }
  })
  .catch((e) => {
    console.error(e)
    alert(e.toString())
  })
}

export function MemberList() {
  const {openMembers, setOpenMembers} = React.useContext(OpenMembersContext)
  const [members, setMembers] = React.useState([])
  const loginContext = React.useContext(LoginContext)

  React.useEffect(() => {
    fetchMembers(setMembers, loginContext.accessToken)
  }, [loginContext.accessToken])

  // console.log(openMembers)

  // const handleClickOpen = () => {
  //   setOpenMembers(true);
  // };

  const handleClose = () => {
    setOpenMembers(false);
  };

  return (
    <React.Fragment>
      <Dialog
        fullScreen
        open={openMembers}
        onClose={handleClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="member close"
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              Add Friend
            </Typography>
          </Toolbar>
        </AppBar>
        <List>
          {members && 
            members.map((member: any) => (
              <ListItem key={member.id}>
                <MemberCard member={member} members={members} setMembers={setMembers} />
              </ListItem>
            ))}
        </List>
      </Dialog>
    </React.Fragment>
  );
}