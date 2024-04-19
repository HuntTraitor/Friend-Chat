import { Avatar, Grid, IconButton, Typography } from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'; // Assuming you import PersonRemoveIcon properly
import {Confirmation} from '../Confirmation'
import * as React from 'react'
import { FriendsContext } from '@/context/Friends';
import { LoginContext } from '@/context/Login';

const removeFriend = (friend: any, setFriends: Function, friends: any, accessToken: string) => {
  const query = {query: `mutation removeFriend{removeFriend(input: {
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
        console.log(json)
        setFriends(friends.filter((deletedFriend: any) => deletedFriend.id !== friend.id))
      }
    })
}


export default function FriendCard({friend}: any) {
  const [openConfirmation, setOpenConfirmation] = React.useState(false);
  const loginContext = React.useContext(LoginContext)
  const {friends, setFriends} = React.useContext(FriendsContext)

  console.log(friends)

  const handleConfirmationOpen = () => {
    setOpenConfirmation(true);
  };

  const handleConfirmationClose = () => {
    setOpenConfirmation(false);
  };
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
        <IconButton onClick={handleConfirmationOpen}>
          <PersonRemoveIcon />
        </IconButton>
        <Confirmation 
          open={openConfirmation}
          setOpen={setOpenConfirmation}
          title={`Are you sure you want to remove ${friend.name} as a friend?`}
          content={"This will prevent you from seeing their posts"}
          trigger={() => removeFriend(friend, setFriends, friends, loginContext.accessToken)}
        />
      </Grid>
    </Grid>
  );
}