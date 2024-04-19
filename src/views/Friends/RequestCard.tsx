import { Avatar, Grid, IconButton, Typography } from '@mui/material';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove'; // Assuming you import PersonRemoveIcon properly
import OutboundIcon from '@mui/icons-material/Outbound';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

export function RequestCard({friend, bound}: any) {
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
        <IconButton>
          { bound === "outbound" && <OutboundIcon />}
          { bound === "inbound" && <CheckCircleOutlineIcon />}
        </IconButton>
        <IconButton>
          <PersonRemoveIcon />
        </IconButton>
      </Grid>
    </Grid>
  );
}