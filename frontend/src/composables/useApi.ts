import { getActivePinia } from 'pinia'
import { ref } from 'vue'
import { Api, type HttpResponse } from '@sdk/api'

const api = new Api({
  baseUrl: 'http://localhost:3000',
})

const handle = <T, D>(response: Promise<HttpResponse<T, D>>) => {
  return response.then((r) => r.json())
}

export default function useApi() {
  const fetchInfo = async () => {
    return handle(api.info.infoList())
  }
  return { fetchInfo }
}
