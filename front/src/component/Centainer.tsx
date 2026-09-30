import { Container } from "@mui/material";

export default function Centainer({ children }: any) {
  return <>
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      {children}
    </Container>
  </>
}
