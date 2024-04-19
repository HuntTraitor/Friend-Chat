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

export function MemberCard({member}: any) {
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
        <IconButton>
          <PersonAddIcon />
        </IconButton>
        <IconButton>
          <PersonRemoveIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}