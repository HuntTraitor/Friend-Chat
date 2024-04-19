import { Avatar, Grid, IconButton, Typography } from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'; // Assuming you import PersonRemoveIcon properly
import OutboundIcon from '@mui/icons-material/Outbound';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import * as React from 'react'
import { LoginContext } from '@/context/Login';
import { FriendsContext } from '@/context/Friends';
import { Confirmation } from '../Confirmation';
import { RequestContext } from '@/context/Requests';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

const sendRequest = (friend: any, requestsContext: any, members: any, setMembers: Function, accessToken: string) => {
  const requests = requestsContext.requests
  const setRequests = requestsContext.setRequests
  const query = {query: `mutation makeRequest{makeRequest(input: {
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
      setMembers(members.filter((deletedMember: any) => deletedMember.id !== friend.id))
      setRequests({
        inbound: requests.inbound,
        outbound: [...requests.outbound, json.data.makeRequest]
      })
    }
  })
  .catch((e) => {
    console.error(e)
  })
}

export function MemberCard({member, members, setMembers}: any) {
  const [openConfirmation, setOpenConfirmation] = React.useState(false);
  const loginContext = React.useContext(LoginContext)
  const requestContext = React.useContext(RequestContext)

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
          {member.name}
        </Typography>
      </Grid>
      <Grid item>
        <IconButton onClick={handleConfirmationOpen}>
          <PersonAddIcon />
        </IconButton>
        <Confirmation 
          open={openConfirmation}
          setOpen={setOpenConfirmation}
          title={`Are you sure you want to add ${member.name} as a friend?`}
          content={"This will notify them that you would like to be friends"}
          trigger={() => sendRequest(member, requestContext, members, setMembers, loginContext.accessToken)}
        />
      </Grid>
    </Grid>
  );
}