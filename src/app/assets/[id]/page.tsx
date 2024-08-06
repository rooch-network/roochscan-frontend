"use client"
import React, { useEffect, useMemo } from "react";
import Block from "@/views/block"
import useStore from "@/store"
import useSWR from "swr";
import { getTransactionsByHash, queryBalance } from "@/api";
import { Breadcrumb } from "antd";
import { timeFormat } from "@/utils";

export default function BlockServer({ params }: { params: { id: string } }) {
    const { roochNodeUrl } = useStore()
    const { data } = useSWR(params.id ? [roochNodeUrl, params.id] : null, ([key, tx]) => queryBalance(tx), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0,
    })

    useEffect(() => {
        console.log("blocks:---------", data);
    }, [data])
    // getTransactionsByHash
    if (params.id.startsWith("0x")) {
        console.log("字符串以 '0x' 开头");
    } else {
        console.log("字符串不以 '0x' 开头");
    }
    return <div className="container mx-auto mt-[80px]">
        <Breadcrumb
            items={[
                {
                    title: 'Home',
                },

                {
                    title: 'Block',
                },
            ]}
        />
        <div className=" rounded-md mt-20 border border-light-gray shadow-md p-20 bg-white">

            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    balance
                </div>
                <div>
                    {data?.result?.balance}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    coin_type
                </div>
                <div>
                    {data?.result?.coin_type}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    decimals
                </div>
                <div>
                    {data?.result?.decimals}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    name
                </div>
                <div>
                    {data?.result?.name}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    supply
                </div>
                <div>
                    {data?.result?.supply}
                </div>
            </div>
            <div className="flex item-center border-b border-light-gray pt-15 pb-15">
                <div className="w-1/4">
                    symbol
                </div>
                <div>
                    {data?.result?.symbol}
                </div>
            </div>
        </div>
    </div>
}