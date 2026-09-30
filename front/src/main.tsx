import { createContext, StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createBrowserRouter, RouterProvider } from "react-router";
import { createTheme, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import LoginPage from './page/Login.tsx';
import MatchPage from './page/Match.tsx';
import StartMatchPage from './page/StartMatch.tsx';
import UserPage from './page/User.tsx';
import Root from './Root.tsx';
import OauthPage from './page/Oauth.tsx';
import axios from 'axios';

const router = createBrowserRouter([
  {
    path: '/',
    Component: Root,
    children: [
      {
        index: true,
        Component: StartMatchPage,
      },
      {
        path: 'login',
        Component: LoginPage,
      },
      {
        path: 'user',
        Component: UserPage,
      },
      {
        path: 'match',
        Component: MatchPage,
      },
      {
        path: 'oauth/:service',
        Component: OauthPage,
      }
    ]
  }
])

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
})

export const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

export const gameNames = [
  'Dots (paper-and-pencil)',
  'Russian draughts',
]

type GlobCtx = {
  isMobile: boolean,
  game: string,
  setGame: (_: string) => void,
}

export const GlobCtx = createContext<GlobCtx | null>(null)

function GlobProvider({ children }: any) {
  const selectedGame = localStorage.getItem('game') ?? '0'
  const [game, setGame] = useState(selectedGame)

  return <GlobCtx value={{
    isMobile: useMediaQuery('(max-width: 768px)'),
    game,
    setGame: (game: string) => {
      localStorage.setItem('game', game)
      setGame(game)
    },
  }}>
    {children}
  </GlobCtx>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <GlobProvider>
        <RouterProvider router={router} />
      </GlobProvider>
    </ThemeProvider>
  </StrictMode>
)
