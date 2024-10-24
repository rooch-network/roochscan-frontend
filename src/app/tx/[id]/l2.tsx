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
   
    return <div className="container mx-auto mt-[80px]">
    
    <div className=" rounded-md mt-20 border border-light-gray shadow-md p-20 bg-white">

        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                event_root
            </div>
            <div>
                {blockDetail?.execution_info.event_root}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                gas_used
            </div>
            <div>
                {blockDetail?.execution_info.gas_used}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                state_root
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
                tx_hash
            </div>
            <div>
                {blockDetail?.execution_info.tx_hash}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                raw
            </div>
            <div className=" w-3/4 break-words">
                {blockDetail?.transaction.data.raw}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
            sender
            </div>
            <div>
            {blockDetail?.transaction.data.sender}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
            sender bitcoin address
            </div>
            <div>
            {blockDetail?.transaction.data.sender_bitcoin_address}
            </div>
        </div>
        
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
            sequence number
            </div>
            <div>
                {blockDetail?.transaction.data.sequence_number}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
            action_type
            </div>
            <div>
                {blockDetail?.transaction.data.action_type}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                function id
            </div>
            <div>
            {blockDetail?.transaction.data.action.function_call.function_id}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                function args
            </div>
            <div>
            {blockDetail?.transaction.data.action.function_call.args.map(v => <div key={v}>{v}</div>)}
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
                tx_accumulator_root
            </div>
            <div>
                {blockDetail?.transaction.sequence_info.tx_accumulator_root}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                tx_order
            </div>
            <div>
                {blockDetail?.transaction.sequence_info.tx_order}
            </div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">
                tx_order_signature
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