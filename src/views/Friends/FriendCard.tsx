import { Avatar, Grid, IconButton, Typography } from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'; // Assuming you import PersonRemoveIcon properly
import {Confirmation} from '../Confirmation'
import * as React from 'react'
import { LoginContext } from '@/context/Login';
import { RefetchContext } from '@/context/Refetch';

const removeFriend = (friend: any, setRefetch: Function, accessToken: string) => {
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
        setRefetch(true)
      }
    })
    .catch((e) => {
      alert(e.toString())
    })
}

export default function FriendCard({friend}: any) {
  const [openConfirmation, setOpenConfirmation] = React.useState(false);
  const loginContext = React.useContext(LoginContext)
  const {refetch, setRefetch} = React.useContext(RefetchContext)


  const handleConfirmationOpen = () => {
    setOpenConfirmation(true);
  };

  // const handleConfirmationClose = () => {
  //   setOpenConfirmation(false);
  // };
  return (
    <Grid container alignItems="center" spacing={2}>
      <Grid item>
        <Avatar aria-label='Profile Avatar'/>
      </Grid>
      <Grid item xs>
        <Typography id={"123"} variant="body1" component="div">
          {friend.name}
        </Typography>
      </Grid>
      <Grid item>
        <IconButton onClick={handleConfirmationOpen} aria-label='Remove Friend Icon'>
          <PersonRemoveIcon />
        </IconButton>
        <Confirmation 
          open={openConfirmation}
          setOpen={setOpenConfirmation}
          title={`Are you sure you want to remove ${friend.name} as a friend?`}
          content={"This will prevent you from seeing their posts"}
          trigger={() => removeFriend(friend, setRefetch, loginContext.accessToken)}
        />
      </Grid>
    </Grid>
  );
}