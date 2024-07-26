import { IResponse, ITransactionsByOrderResponse } from "@/types"
import server from "./server"
import useStore from "@/store"
const generatorParams = (method: string, params = [null, null], id = Math.floor(Math.random() * 400)) => (
  {
    id,
    jsonrpc: "2.0",
    method,
    params
  }
)

export const queryBlockList = (): Promise<IResponse<{ data: ITransactionsByOrderResponse[] }>> => {
  return server.post(useStore.getState().roochNodeUrl, generatorParams('rooch_getTransactionsByOrder'))
}

export const queyChainID = (): Promise<IResponse<string>> => {
  return server.post(useStore.getState().roochNodeUrl, generatorParams('rooch_getChainID'))
}