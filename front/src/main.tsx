import { createContext, StrictMode, useContext } from 'react'
import { createRoot } from 'react-dom/client'

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { createBrowserRouter, RouterProvider } from "react-router";
import { createTheme, CssBaseline, ThemeProvider, useMediaQuery } from '@mui/material';
import GamesGridPage from './page/GamesGrid.tsx';
import LoginPage from './page/Login.tsx';
import MatchPage from './page/Match.tsx';
import StartMatchPage from './page/StartMatch.tsx';
import UserPage from './page/User.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    Component: GamesGridPage,
  },
  {
    path: '/login',
    Component: LoginPage,
  },
  {
    path: '/user',
    Component: UserPage,
  },
  {
    path: '/start-match',
    Component: StartMatchPage,
  },
  {
    path: '/match',
    Component: MatchPage,
  },
])

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
})

type GlobCtx = {
  isMobile: boolean
}

export const GlobCtx = createContext<GlobCtx | null>(null)

function GlobProvider({ children }: any) {
  return <GlobCtx value={{ isMobile: useMediaQuery('(max-width: 768px)') }}>
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
