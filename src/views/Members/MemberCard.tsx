import { Avatar, Grid, IconButton, Typography } from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'; // Assuming you import PersonRemoveIcon properly
import OutboundIcon from '@mui/icons-material/Outbound';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import * as React from 'react'
import { LoginContext } from '@/context/Login';
import { Confirmation } from '../Confirmation';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { RefetchContext } from '@/context/Refetch';

const sendRequest = (friend: any, setRefetch: Function, accessToken: string) => {
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
      setRefetch(true)
    }
  })
  .catch((e) => {
    console.error(e)
    alert(e.toString())
  })
}

export function MemberCard({member}: any) {
  const [openConfirmation, setOpenConfirmation] = React.useState(false);
  const loginContext = React.useContext(LoginContext)
  const {refetch, setRefetch} = React.useContext(RefetchContext)

  const handleConfirmationOpen = () => {
    setOpenConfirmation(true);
  };

  return (
    <Grid container alignItems="center" spacing={2}>
      <Grid item>
        <Avatar aria-label='Member Avatar'/>
      </Grid>
      <Grid item xs>
        <Typography id={"123"} variant="body1" component="div">
          {member.name}
        </Typography>
      </Grid>
      <Grid item>
        <IconButton onClick={handleConfirmationOpen}>
          <PersonAddIcon aria-label='Add Member Icon'/>
        </IconButton>
        <Confirmation 
          open={openConfirmation}
          setOpen={setOpenConfirmation}
          title={`Are you sure you want to add ${member.name} as a friend?`}
          content={"This will notify them that you would like to be friends"}
          trigger={() => sendRequest(member, setRefetch, loginContext.accessToken)}
        />
      </Grid>
    </Grid>
  );
}