import React from "react";
import Transaction from "@/views/Tx"
import { queryTxDetail } from "@/api"
export default async function BlockServer({ params }: { params: { id: string } }) {
    const txDetail = await queryTxDetail(params.id)
    return <Transaction tx={txDetail} />
}