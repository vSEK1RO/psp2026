import { useContext } from "react";
import { Outlet, useLocation, useNavigate } from "react-router";
import { GlobCtx } from "./main";
import { BottomNavigation, BottomNavigationAction, Paper, Stack } from "@mui/material";
import { Link as LinkIcon, AddCircle, Leaderboard } from "@mui/icons-material";
import TopAppBar from "./widget/TopAppBar";

function Nav() {
  const navigate = useNavigate()
  const location = useLocation()

  function handleChange(_: any, value: string) {
    navigate(value)
  }

  return <BottomNavigation
    showLabels
    value={location.pathname}
    onChange={handleChange}
  >
    <BottomNavigationAction value='/user' label="Leaderboard" icon={<Leaderboard />} />
    <BottomNavigationAction value='/' label="Start match" icon={<AddCircle />} />
    <BottomNavigationAction value='/match' label="Connect to match" icon={<LinkIcon />} />
  </BottomNavigation>
}

export default function Root() {
  const globCtx = useContext(GlobCtx)!

  return <Stack>
    <TopAppBar>
      {!globCtx.isMobile && <Nav />}
    </TopAppBar>
    <Outlet />
    {globCtx.isMobile &&
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} variant='outlined'>
        <Nav />
      </Paper>}
  </Stack>
}
