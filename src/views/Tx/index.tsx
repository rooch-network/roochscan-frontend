"use client"
import { Transaction } from "@/types";
import { timeFormat } from "@/utils";
import React, { useEffect } from "react";

export default function Transaction({ tx }: { tx: Transaction }) {
    useEffect(() => {
        console.log("tx detail -----", tx);
    })

    return <div className="container mx-auto mt-20">
        <div>
            <span className="text-2xl mr-10">
                Transaction Details
            </span>
        </div>
        <div className=" rounded-md mt-20 border border-light-gray shadow-md p-20 bg-white">
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    L1:
                </div>
                <div>
                    {tx.da_height}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    Status:
                </div>
                <div>
                    {tx.status}
                </div>
            </div>

            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    Time:
                </div>
                <div>
                    {timeFormat(tx.timestamp)}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    Transaction Hash:
                </div>
                <div>
                    {tx.id}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    block Hash:
                </div>
                <div>
                    {tx.block_hash}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    Gas Price:
                </div>
                <div>
                    {Number(tx.gas_price) + Number(tx.gas_limit)} WEI
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    Sender:
                </div>
                <div>
                    {tx.sender}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    Transaction Type:
                </div>
                <div>
                    {tx.tx_type}
                </div>
            </div>
        </div>
    </div>
}