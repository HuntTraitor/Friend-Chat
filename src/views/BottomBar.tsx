import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import { LoginContext } from '@/context/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';

/**
 *
 * @return {object} JSX
 */
export default function BottomBar({setOpenFriends}: any) {
  const loginContext = React.useContext(LoginContext)
  const ref = React.useRef(null);

  const logout = () => {
    loginContext.setAccessToken('')
    localStorage.removeItem('accessToken')
  }

  return (
    <Box sx={{pb: 7}} ref={ref}>
      <CssBaseline />
      <Paper
        sx={{position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
        }}
        elevation={3}>
        <BottomNavigation
          showLabels
          value={0}
          sx={{
            '& .Mui-selected': {
              color: 'purple', // Color for the selected label
            },
            '& .Mui-selected .MuiSvgIcon-root': {
              color: 'purple', // Color for the selected icon
            },
          }}
        >
          <BottomNavigationAction
            aria-label="Home"
            icon={<HomeIcon />}
          />
          <BottomNavigationAction
            aria-label="Friends"
            icon={<PeopleIcon />}
            onClick={() => setOpenFriends(true)}
          />
          <BottomNavigationAction
            aria-label="Logout"
            icon={<LogoutIcon />}
            onClick={logout}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
}
