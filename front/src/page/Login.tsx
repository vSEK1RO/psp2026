import { Button, Card, CardContent, CardHeader, Stack } from "@mui/material";
import GoogleIcon from '../asset/google.svg?react'
import YandexIcon from '../asset/yandex.svg?react'
import Centainer from "../component/Centainer";

export default function LoginPage() {
  const buttons: React.ReactNode[] = []

  function addButton(icon: React.ReactNode, name: string, handler: () => void) {
    buttons.push(<Button
      variant='outlined'
      size='large'
      startIcon={icon}
      onClick={handler}
    >
      Log in with {name}
    </Button>)
  }

  /*
   * Create form to request access token from Google's OAuth 2.0 server.
   */
  function oauthSignIn() {
    // Google's OAuth 2.0 endpoint for requesting an access token
    var oauth2Endpoint = 'https://accounts.google.com/o/oauth2/v2/auth';

    // Create <form> element to submit parameters to OAuth 2.0 endpoint.
    var form = document.createElement('form');
    form.setAttribute('method', 'GET'); // Send as a GET request.
    form.setAttribute('action', oauth2Endpoint);

    // Parameters to pass to OAuth 2.0 endpoint.
    var params: any = {
      'client_id': '768972603313-vdus3bitvc2j8thvsq1euq41496po8kf.apps.googleusercontent.com',
      'redirect_uri': import.meta.env.VITE_ORIGIN + '/oauth/google',
      'response_type': 'token',
      'scope': 'openid email profile',
      'include_granted_scopes': 'true',
    };

    // Add form parameters as hidden input values.
    for (var p in params) {
      var input = document.createElement('input');
      input.setAttribute('type', 'hidden');
      input.setAttribute('name', p);
      input.setAttribute('value', params[p]);
      form.appendChild(input);
    }

    // Add form to page and submit it to open the OAuth 2.0 endpoint.
    document.body.appendChild(form);
    form.submit();
  }

  addButton(<GoogleIcon />, 'google', () => {
    oauthSignIn()
  })
  addButton(<YandexIcon />, 'yandex', () => { })

  return <Centainer>
    <Card sx={{ width: '24rem' }}>
      <CardHeader title="Log in and start playing 1x1!" />
      <CardContent>
        <Stack spacing={1}>{buttons}</Stack>
      </CardContent>
    </Card>
  </Centainer>
}
