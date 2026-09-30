import { useParams } from "react-router"
import { api } from "../main"
import { useEffect, useState } from "react"
import Centainer from "../component/Centainer"

export type OauthReq = {
  code: string
}

export type OauthRes = {
  user: {
    email: string,
    name: string,
    picture: string,
    given_name: string,
    family_name: string,
  }
}

export default function OauthPage() {
  const { service } = useParams()
  const [result, setResult] = useState<string>('Please wait a little bit...');

  useEffect(() => {
    async function authenticate() {

      const params = new URLSearchParams(
        window.location.hash.slice(1),
      )

      let code = ''

      switch (service) {
        case 'google': code = params.get('access_token')!; break
        case 'yandex': code = params.get('access_token')!; break
        default: throw new Error(`oauth service unknown: ${service}`)
      }

      const res = await api.post<OauthRes>(`/oauth/${service}`, { code })

      setResult(JSON.stringify(res.data))
    }

    authenticate().catch(e => setResult(e.message))
  }, [service])

  return <Centainer>{result}</Centainer>
}
