import { Api, type HttpResponse } from '@sdk/api'

const api = new Api({
  baseUrl: 'http://localhost:3000',
})

const handle = async <T, D>(response: Promise<HttpResponse<T, D>>) => {
  const r = await response
  return await r.json()
}

export default function useApi() {
  const fetchInfo = async () => {
    return handle(api.info.infoList())
  }
  return { fetchInfo }
}
