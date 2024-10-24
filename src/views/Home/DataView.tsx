"use client"
import React, { useEffect } from "react";
import DataList from "@/components/DataList";
import useStore from "@/store"
import { queryBlockList } from "@/api/index"
import useSWR from "swr";
import { BlockType } from "@/types";
export default function DataView() {
    const { roochNodeUrl } = useStore()
    const { data } = useSWR(roochNodeUrl, () => queryBlockList([null,null]))
    useEffect(() => {
        console.log("blocks:---------", data);
    }, [data])

    return <div className="mt-20 container mx-auto flex justify-between">
        <DataList blocks={data?.result?.data || []} type={BlockType.Block} isAll  />
    </div>
}