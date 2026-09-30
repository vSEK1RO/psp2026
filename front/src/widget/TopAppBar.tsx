import { AccountCircle } from "@mui/icons-material";
import { AppBar, Button, Container, MenuItem, Select, Stack, Toolbar, Typography, type SelectChangeEvent } from "@mui/material";
import { useContext } from "react";
import { gameNames, GlobCtx } from "../main";
import { useNavigate } from "react-router";

export default function TopAppBar({ children }: any) {
  const navigate = useNavigate()
  const globCtx = useContext(GlobCtx)!
  const gameComps = []

  for (let i = 0; i < gameNames.length; ++i) {
    gameComps.push(<MenuItem value={i}>{gameNames[i]}</MenuItem>)
  }

  function handleChange(e: SelectChangeEvent) {
    globCtx.setGame(e.target.value)
  }

  return <>
    <AppBar position='static' variant='outlined' sx={{ zIndex: 1000 }}>
      <Toolbar sx={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center'
      }}>
        <Stack
          direction='row'
          sx={{ alignItems: 'center' }}
          spacing={1}
        >
          <Typography>1x1</Typography>
          <Select
            size='small'
            value={globCtx.game}
            onChange={handleChange}
          >
            {gameComps}
          </Select>
        </Stack>
        <Container>
          {children}
        </Container>
        <Container sx={{ display: 'flex', justifyContent: 'end' }}>
          <Button
            size='large'
            sx={{ width: 'fit-content' }}
            endIcon={<AccountCircle />}
            onClick={() => { navigate('/login') }}
          >
            login
          </Button>
        </Container>
      </Toolbar>
    </AppBar>
  </>
}
