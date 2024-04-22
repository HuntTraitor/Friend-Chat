import { Avatar, Grid, IconButton, Typography } from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'; // Assuming you import PersonRemoveIcon properly
import OutboundIcon from '@mui/icons-material/Outbound';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import * as React from 'react'
import { LoginContext } from '@/context/Login';
import { Confirmation } from '../Confirmation';
import { RefetchContext } from '@/context/Refetch';

const acceptFriend = (friend: any, setRefetch: Function, accessToken: string) => {
  // const requests = requestContext.requests
  // const setRequests = requestContext.setRequests
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
      // setRequests({
      //   inbound: requests.inbound.filter((request: any) => request.id !== friend.id),
      //   outbound: requests.outbound
      // })
      setRefetch(true)
    }
  })
  .catch((e) => {
    alert(e.toString())
  })
}

const removeRequest = (request: any, setRefetch: Function, accessToken: string) => {
  const query = {query: `mutation removeRequest{removeRequest(input: {
    memberId: "${request.id}"
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

export function RequestCard({friend, bound}: any) {
  const [openConfirmation, setOpenConfirmation] = React.useState(false);
  const loginContext = React.useContext(LoginContext)
  const {refetch, setRefetch} = React.useContext(RefetchContext)

  const [alternateConfirmation, setAlternateConfirmation] = React.useState(false)


  const handleConfirmationOpen = () => {
    setOpenConfirmation(true);
  };

  return (
    <Grid container alignItems="center" spacing={2}>
      <Grid item>
        <Avatar aria-label='Request Avatar'/>
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
          { bound === "outbound" && <OutboundIcon aria-label='Outbound Icon'/> }
          { bound === "inbound" && <CheckCircleOutlineIcon aria-label='Inbound Icon'/> }
        </IconButton>
        <IconButton onClick={() => {setAlternateConfirmation(true)}}>
          <PersonRemoveIcon aria-label='Remove Request Icon'/>
        </IconButton>
        <Confirmation 
          open={alternateConfirmation}
          setOpen={setAlternateConfirmation}
          title={`Are you sure you want to remove ${friend.name}'s request`}
          content={"This will take you off of their request list"}
          trigger={() => removeRequest(friend, setRefetch, loginContext.accessToken)}
        />
        <Confirmation 
          open={openConfirmation}
          setOpen={setOpenConfirmation}
          title={`Are you sure you want to accept ${friend.name} as a friend?`}
          content={"This will allow you to see all of their posts"}
          trigger={() => acceptFriend(friend, setRefetch, loginContext.accessToken)}
        />
      </Grid>
    </Grid>
  );
}