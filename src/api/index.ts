import server from "./server"
import useStore from "@/store"
interface IResponse<T> {
  id: number,
  jsonrpc: string,
  result: T
}
const generatorParams = (id: number, method: string, params = [null, null]) => (
  {
    id,
    jsonrpc: "2.0",
    method,
    params
  }
)

export const queryBlockList = () => {
  return server.post(useStore.getState().roochNodeUrl)
}

export const queyChainID = (): Promise<IResponse<string>> => {
  return server.post(useStore.getState().roochNodeUrl, generatorParams(0, 'rooch_getChainID'))
}