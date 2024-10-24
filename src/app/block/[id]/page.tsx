"use client"
import React, { useEffect, useMemo } from "react";
import Block from "@/views/block"
import useStore from "@/store"
import useSWR from "swr";
import { getTransactionsByHash } from "@/api";
import { Breadcrumb } from "antd";
import { timeFormat } from "@/utils";
import L1Page from "./l1"
import L2Page from "./l2"
export default function BlockServer({ params }: { params: { id: string } }) {
    const { roochNodeUrl } = useStore()
    const { data } = useSWR(params.id ? [roochNodeUrl,params.id] : null, ([key,tx]) => getTransactionsByHash(tx), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0,
    })
    const blockDetail = useMemo(() => data?.result[0], [data])
    useEffect(() => {
        console.log("blockDetail:---------", blockDetail);
    }, [blockDetail])
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
        {
            blockDetail?.transaction.data.type === "l2_tx" ? <L2Page blockDetail={blockDetail} /> : <L1Page blockDetail={blockDetail!} />
        }
    </div>
}