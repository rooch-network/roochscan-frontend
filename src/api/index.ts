import { IResponse, ITransactionsByOrderResponse } from "@/types"
import server from "./server"
import useStore from "@/store"
const generatorParams = (method: string, params: any[] = [null, null], id = Math.floor(Math.random() * 400)) => (
  {
    id,
    jsonrpc: "2.0",
    method,
    params
  }
)

export const queryBlockList = (params: any[] = [null, null]): Promise<IResponse<{ data: ITransactionsByOrderResponse[] }>> => {
  return server.post(useStore.getState().roochNodeUrl, generatorParams('rooch_getTransactionsByOrder', params))
}

export const queyChainID = (): Promise<IResponse<string>> => {
  return server.post(useStore.getState().roochNodeUrl, generatorParams('rooch_getChainID'))
}

export const queryBalances = (address: string) => {
  return server.post(useStore.getState().roochNodeUrl, generatorParams('rooch_getBalances', [address, null, '5']))
}

// 查询主链的余额资产
export const queryBalance = (address: string) => {
  return server.post(useStore.getState().roochNodeUrl, generatorParams('rooch_getBalance', [address, '0x3::gas_coin::GasCoin']))
}

export const queryGetStatus = () => {
  const params = ["/object/0xd9858821a52538c99f822d3f90ec798f76466bb7a1e82ebdb42d19b62a030069::quick_start_object_counter::Counter", { "decode": true }]
  return server.post(useStore.getState().roochNodeUrl, generatorParams('rooch_getStates', params))
}

export const getTransactionsByHash = () => {
  const params = [['0x08156186e176ae50d5e15cd52fd1225089621eef716dbb05736422ed1be58f8a']]
  return server.post(useStore.getState().roochNodeUrl, generatorParams('rooch_getTransactionsByHash', params))
}

export const queryEvents = () => {
  const params = [
    { "sender": "0xd9858821a52538c99f822d3f90ec798f76466bb7a1e82ebdb42d19b62a030069" }, null, "10", true
  ]
  return server.post(useStore.getState().roochNodeUrl, generatorParams('rooch_queryEvents', params))
}