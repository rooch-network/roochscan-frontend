"use client"
import React, { useEffect, useMemo } from "react";
import Block from "@/views/block"
import useStore from "@/store"
import useSWR from "swr";
import { getTransactionsByHash } from "@/api";
import { Breadcrumb } from "antd";
import { timeFormat } from "@/utils";
import { ITransactionsByOrderResponse } from "@/types";

export default function BlockServer({ blockDetail }: { blockDetail: ITransactionsByOrderResponse }) {
   
    return <div className="container mx-auto ">
    
    <div className=" rounded-md mt-20 border border-light-gray shadow-md p-20 bg-white">

        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
            event root hash
            </div>
            <div>
                {blockDetail?.execution_info.event_root}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
            Gas
            </div>
            <div>
            {(Number(blockDetail?.execution_info?.gas_used) / 1e9).toFixed(6) || "0.0"} RGas
                {/* {blockDetail?.execution_info.gas_used} */}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
            state root
            </div>
            <div>
                {blockDetail?.execution_info.state_root}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                status
            </div>
            <div>
                {blockDetail?.execution_info.status.type}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
            tx hash
            </div>
            <div>
                {blockDetail?.execution_info.tx_hash}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                bitcoin block hash
            </div>
            <div>
                {blockDetail?.transaction.data.bitcoin_block_hash}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                bitcoin_txid
            </div>
            <div>
                {blockDetail?.transaction.data.bitcoin_txid}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                block hash
            </div>
            <div>
                {blockDetail?.transaction.data.block_hash}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                chain id
            </div>
            <div>
                {blockDetail?.transaction.data.chain_id}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                txid
            </div>
            <div>
                {blockDetail?.transaction.data.txid}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                type
            </div>
            <div>
                {blockDetail?.transaction.data.type}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                tx accumulator root
            </div>
            <div>
                {blockDetail?.transaction.sequence_info.tx_accumulator_root}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                tx order
            </div>
            <div>
                {blockDetail?.transaction.sequence_info.tx_order}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                tx order signature
            </div>
            <div className="  w-3/4 break-words">
                {blockDetail?.transaction.sequence_info.tx_order_signature}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                time
            </div>
            <div>
                {timeFormat(Number(blockDetail?.transaction.sequence_info.tx_timestamp))}
            </div>
        </div>
    </div>
</div>
}