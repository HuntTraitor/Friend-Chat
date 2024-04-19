import * as React from 'react';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import BottomNavigation from '@mui/material/BottomNavigation';
import BottomNavigationAction from '@mui/material/BottomNavigationAction';
import Paper from '@mui/material/Paper';
import HomeIcon from '@mui/icons-material/Home';
import SearchIcon from '@mui/icons-material/Search';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import {NavigationContext} from '../context/Navigation';
import { LoginContext } from '@/context/Login';
import LogoutIcon from '@mui/icons-material/Logout';
import PeopleIcon from '@mui/icons-material/People';
import { OpenFriendsContext } from '@/context/OpenFriends';

/**
 *
 * @return {object} JSX
 */
export default function BottomBar() {
  const loginContext = React.useContext(LoginContext)
  const {navigation, setNavigation} = React.useContext(NavigationContext);
  const {openFriends, setOpenFriends} = React.useContext(OpenFriendsContext)
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
          onChange={(event, newValue) => {
            setNavigation(newValue);
          }}
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
            disabled={navigation === 0}
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
