import { BlockDetail, Transaction } from '@/types'
import { NextResponse } from 'next/server'
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

const revalidate = { next: { revalidate: 30 } }
// 查询block数据
export const queryBlock = async () => {
  const res = await fetch(baseUrl + "/block", revalidate)
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  return res.json()
}

// 查询block数据
export const queryTxs = async () => {
  const res = await fetch(baseUrl + "/transaction", revalidate)
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  return res.json()
}

// 根据制定blockHash查询查询交易
export const queryBlockDetail = async (id: string): Promise<BlockDetail> => {
  const res = await fetch(baseUrl + "/block/" + id, revalidate)
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  return res.json()
}

// 根据制定hash 查询交易
// 根据制定blockHash查询查询交易
export const queryTxDetail = async (hash: string): Promise<Transaction> => {
  const res = await fetch(baseUrl + "/transaction/" + hash, revalidate)
  if (!res.ok) {
    throw new Error('Failed to fetch data')
  }
  return res.json()
}