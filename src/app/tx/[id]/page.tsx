"use client";
import React, { useEffect, useMemo } from "react";
import Block from "@/views/block";
import useStore from "@/store";
import useSWR from "swr";
import { getTransactionsByHash } from "@/api";
import { Breadcrumb, Tabs, TabsProps } from "antd";
import { timeFormat } from "@/utils";
import L1Page from "./l1";
import L2Page from "./l2";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { duotoneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
export default function BlockServer({ params }: { params: { id: string } }) {
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
  useEffect(() => {
    console.log("blockDetail:---------", blockDetail);
  }, [blockDetail]);
  // getTransactionsByHash
  if (params.id.startsWith("0x")) {
    console.log("字符串以 '0x' 开头");
  } else {
    console.log("字符串不以 '0x' 开头");
  }
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Overview",
      children:
        blockDetail?.transaction.data.type === "l2_tx" ? (
          <L2Page blockDetail={blockDetail} />
        ) : (
          <L1Page blockDetail={blockDetail!} />
        ),
    },
    {
      key: "2",
      label: "Raw JSON",
      children: (
        <SyntaxHighlighter
          language="json"
          style={duotoneLight}
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
  return (
    <div className="container mx-auto mt-[80px]">
      <Breadcrumb
        items={[
          {
            title: "Home",
          },

          {
            title: "Transaction",
          },
        ]}
      />
      <div className="mt-[40px]">{params.id}</div>
      <Tabs defaultActiveKey="1" className="mt-[40px]" items={items} />
    </div>
  );
}
