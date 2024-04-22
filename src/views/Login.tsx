import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import React from 'react'
import { LoginContext } from '../context/Login';
import FormControlLabel from '@mui/material/FormControlLabel';
import { inputLabelClasses } from "@mui/material/InputLabel";

// TODO remove, this demo shouldn't need to reset the theme.

// const defaultTheme = createTheme();

export function Login() {
  const loginContext = React.useContext(LoginContext)
  const [checked, setChecked] = React.useState(false)
  
  const onSubmit = (event: any) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const query = {query: `query login{login(email: "${data.get('email')}" password: "${data.get('password')}") {name, accessToken}}`};
    fetch('/api/graphql', {
      method: 'POST',
      body: JSON.stringify(query),
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then((res) => {
        return res.json();
      })
      .then((json) => {
        if (json.errors) {
          alert(`${json.errors[0].message}`)
        } else {
          loginContext.setAccessToken(json.data.login.accessToken)
          loginContext.setUserName(json.data.login.name)
          if (checked) {
            localStorage.setItem('accessToken', json.data.login.accessToken)
          }
        }
      })
      .catch((e) => {
        console.log(e)
        alert(e)
      });
  };
  if (loginContext.accessToken.length < 1) {
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{m: 5, backgroundColor: 'purple'}}
            src="https://media.licdn.com/dms/image/D5603AQEwzccU1co_1A/profile-displayphoto-shrink_200_200/0/1683171781164?e=2147483647&v=beta&t=5B-mtION5BnXnYCwkX3cKfccsTVDGveYJIdfIdccO4E">
          </Avatar>
          <Typography component="h1" variant="h5">
            CSE187 Assignment 3
          </Typography>
          <Box component="form" onSubmit={onSubmit} noValidate sx={{mt: 1}}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              aria-label="Email Address"
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              aria-label="Password"
            />
            <FormControlLabel
              control={<Checkbox checked={checked} onChange={() => setChecked(!checked)} value="remember" color="primary" aria-label='Remember me checkbox' />}
              label="Remember me"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{mt: 3, mb: 2, backgroundColor: 'purple'}}
              aria-label='Login Button'
            >
              Sign In
            </Button>
          </Box>
        </Box>
      </Container>
    );
  } else {
    return null
  }
}