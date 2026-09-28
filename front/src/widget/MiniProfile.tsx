import { AccountCircle } from "@mui/icons-material";
import { AppBar, Button, Container, Toolbar, Typography } from "@mui/material";

export default function MiniProfile({ children }: any) {
  return <>
    <AppBar position='static' variant='outlined'>
      <Toolbar>
        <Typography sx={{ whiteSpace: 'nowrap' }}>1x1 games</Typography>
        <Container>
          {children}
        </Container>
        <Button size='large' endIcon={<AccountCircle />}>
          login
        </Button>
      </Toolbar>
    </AppBar>
  </>
}
