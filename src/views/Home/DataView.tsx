import React from "react";
import DataList from "@/components/DataList";
import { queryBlock, queryTxs } from "@/api/index"
import { Block, Transaction, BlockType } from "@/types"
export default async function DataView() {
    const blocks = await queryBlock() as Block[]
    const txs = await queryTxs() as Transaction[]
    return <div className="mt-120 container mx-auto flex justify-between">
        <DataList blocks={blocks} type={BlockType.Block} />
        <DataList txs={txs} type={BlockType.Transaction} />
    </div>
}