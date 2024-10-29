"use client";
import React, { useEffect, useMemo } from "react";
import Block from "@/views/block";
import useStore from "@/store";
import useSWR from "swr";
import { getTransactionsByHash, queryGetStatus } from "@/api";
import { Breadcrumb, Tabs, TabsProps } from "antd";
import { timeFormat } from "@/utils";
import L1Page from "./l1";
import L2Page from "./l2";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { duotoneLight ,dark} from "react-syntax-highlighter/dist/esm/styles/prism";
import {useRouter} from "next/navigation"

export default function BlockServer({ params }: { params: { id: string } }) {
    const router = useRouter()
    const { roochNodeUrl } = useStore();
  const { data } = useSWR(
    params.id ? [roochNodeUrl, params.id] : null,
    ([key, tx]) => getTransactionsByHash(tx),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );
  const blockDetail = useMemo(() => data?.result[0], [data]);
  
  const { data:userStatus } = useSWR(
    blockDetail?.transaction.sequence_info.tx_order ? [roochNodeUrl +"QueryGetStatus", blockDetail?.transaction.sequence_info.tx_order] : null,
    ([key, tx]) => queryGetStatus(tx),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );

  // getTransactionsByHash
  if (params.id.startsWith("0x")) {
    console.log("字符串以 '0x' 开头");
  } else {
    console.log("字符串不以 '0x' 开头");
  }
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: <div className="dark:text-white">Overview</div>,
      children:
        blockDetail?.transaction.data.type === "l2_tx" ? (
          <L2Page blockDetail={blockDetail} />
        ) : (
          <L1Page blockDetail={blockDetail!} />
        ),
    },
    {
      key: "2",
      label: <div className="dark:text-white">Raw JSON</div>,
      children: (
        <SyntaxHighlighter
          language="json"
          style={ dark }

          customStyle={{
            whiteSpace: "pre-wrap",
            width: "100%",
            borderRadius: "8px",
            wordBreak: "break-all",
            overflowWrap: "break-word",
          }}
          wrapLines
          wrapLongLines
        >
          {JSON.stringify(blockDetail, null, 2)}
        </SyntaxHighlighter>
      ),
    },
  ];
  const handleRouteHome = () =>{
    router.push("/")
  }
  return (
    <div className="container mx-auto mt-[80px]">
      <Breadcrumb
      className="cursor-pointer dark:text-white"
        
        items={[
          {
            title: "Home",
            onClick:handleRouteHome
          },

          {
            title:  <div className="dark:text-white">Transaction</div> ,
          },
        ]}
      />
      <div className="pc:mt-[40px] mt-[20px] break-words dark:text-white">{params.id}</div>
      <Tabs defaultActiveKey="1" className="pc:mt-[40px] mt-[20px] dark:text-white" items={items} />
    </div>
  );
}
