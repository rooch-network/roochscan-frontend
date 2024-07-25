"use client"
import { BlockDetail } from "@/types";
import { timeFormat } from "@/utils";
import React, { useEffect } from "react";

export default function Block({ blockDetail }: { blockDetail: BlockDetail }) {
    useEffect(() => {
        console.log(blockDetail);
    })

    return <div className="container mx-auto mt-20">
        <div>
            <span className="text-2xl mr-10">
                Block
            </span>
            <span className="text-gray"># {blockDetail.height}</span>
        </div>
        <div className=" rounded-md mt-20 border border-light-gray shadow-md p-20 bg-white">

            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    Block Height:
                </div>
                <div>
                    {blockDetail.height}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    L1:
                </div>
                <div>
                    {blockDetail.da_height}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    Timestamp:
                </div>
                <div>
                    {timeFormat(blockDetail.timestamp)}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    Prevent Root:
                </div>
                <div>
                    {blockDetail.prev_root}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    Hash
                </div>
                <div>
                    {blockDetail.id}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    Transactions:
                </div>
                <div className="flex items-center">
                    <div className=" text-steel-blue w-120 text-center mr-5 rounded-lg bg-off-white cursor-pointer">
                        {blockDetail.transactions.length}
                        transactions
                    </div>
                    in this block
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    Transactions Root:
                </div>
                <div>
                    {blockDetail.transactions_root}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    Coinbase
                </div>
                <div>
                    {blockDetail.coinbase}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    Coinbase Amount
                </div>
                <div>
                    {blockDetail.coinbase_amount}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    Coinbase Hash
                </div>
                <div>
                    {blockDetail.coinbase_hash}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    Output Messages Root Hash
                </div>
                <div>
                    {blockDetail.output_messages_root_hash}
                </div>
            </div>

        </div>
    </div>
}