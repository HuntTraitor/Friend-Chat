import { Avatar, Grid, IconButton, Typography } from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'; // Assuming you import PersonRemoveIcon properly
import OutboundIcon from '@mui/icons-material/Outbound';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import * as React from 'react'
import { LoginContext } from '@/context/Login';
import { FriendsContext } from '@/context/Friends';
import { Confirmation } from '../Confirmation';

const acceptFriend = (friend: any, setFriends: Function, friends: any, accessToken: string) => {
  const query = {query: `mutation accpetRequest{acceptRequest(input: {
    memberId: "${friend.id}"
  }) {
    id name
  }}`}

  fetch('/api/graphql', {
    method: 'POST',
    body: JSON.stringify(query),
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
  })
  .then((res) => {
    return res.json()
  })
  .then((json) => {
    if (json.errors) {
      console.error(json.errors)
    } else {
      setFriends([...friends, friend])
    }
  })
}

export function RequestCard({friend, bound}: any) {
  const [openConfirmation, setOpenConfirmation] = React.useState(false);
  const loginContext = React.useContext(LoginContext)
  const {friends, setFriends} = React.useContext(FriendsContext)


  const handleConfirmationOpen = () => {
    setOpenConfirmation(true);
  };

  const handleConfirmationClose = () => {
    setOpenConfirmation(false);
  };

  console.log(friends)
  return (
    <Grid container alignItems="center" spacing={2}>
      <Grid item>
        <Avatar />
      </Grid>
      <Grid item xs>
        <Typography id={"123"} variant="body1" component="div">
          {friend.name}
        </Typography>
      </Grid>
      <Grid item>
        <IconButton
          onClick={ bound === "inbound" ? handleConfirmationOpen: undefined}
        >
          { bound === "outbound" && <OutboundIcon />}
          { bound === "inbound" && <CheckCircleOutlineIcon/> }
        </IconButton>
        <IconButton>
          <PersonRemoveIcon />
        </IconButton>
        <Confirmation 
          open={openConfirmation}
          setOpen={setOpenConfirmation}
          title={`Are you sure you want to accept ${friend.name} as a friend?`}
          content={"This will allow you to see all of their posts"}
          trigger={() => acceptFriend(friend, setFriends, friends, loginContext.accessToken)}
        />
      </Grid>
    </Grid>
  );
}