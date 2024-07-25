import server from "./server"
import { BlockDetail, Transaction } from '@/types'

export const queryBlockList = () => {
  return server.post("/")
}