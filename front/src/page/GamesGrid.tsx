import { AddCircle, Leaderboard, Link as LinkIcon } from "@mui/icons-material";
import { BottomNavigation, BottomNavigationAction, Paper, Stack } from "@mui/material";
import MiniProfile from '../widget/MiniProfile.tsx';
import { Link } from "react-router";
import { useContext } from "react";
import { GlobCtx } from "../main.tsx";

function Nav() {
  return <BottomNavigation showLabels>
    <BottomNavigationAction label="Leaderboard" icon={<Leaderboard />} >
      <Link to={{ pathname: '/user' }} />
    </BottomNavigationAction>
    <BottomNavigationAction label="Start match" icon={<AddCircle />} >
      <Link to={{ pathname: '/start-match' }} />
    </BottomNavigationAction>
    <BottomNavigationAction label="Connect match" icon={<LinkIcon />} >
      <Link to={{ pathname: '/match' }} />
    </BottomNavigationAction>
  </BottomNavigation>
}

export default function GamesGridPage() {
  const glob_ctx = useContext(GlobCtx)!

  return <Stack>
    <MiniProfile>
      {!glob_ctx.isMobile && <Nav />}
    </MiniProfile>
    {glob_ctx.isMobile &&
      <Paper sx={{ position: 'fixed', bottom: 0, left: 0, right: 0 }} variant='outlined'>
        <Nav />
      </Paper>}
  </Stack>
}
