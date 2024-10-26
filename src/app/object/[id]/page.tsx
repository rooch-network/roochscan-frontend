"use client";
import React from "react";
import {Breadcrumb, Tabs, TabsProps} from "antd";
import {useRouter} from "next/navigation"
import L2Page from "@/app/tx/[id]/l2";
import L1Page from "@/app/tx/[id]/l1";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {duotoneLight} from "react-syntax-highlighter/dist/esm/styles/prism";


export default function Object ({ params }: { params: { id: string } }) {
  const router = useRouter()
  const handleRouteHome = () =>{
    router.push("/")
  }

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Overview",
      children:<div></div>,
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
          {/* {JSON.stringify(blockDetail, null, 2)}*/}
        </SyntaxHighlighter>
      ),
    },
  ];

  return <div className="container mx-auto mt-[80px]">
    <Breadcrumb
      className="cursor-pointer"
      items={[
        {
          title: "Home",
          onClick:handleRouteHome
        },

        {
          title: "Object",
        },
      ]}
    />
    <div className="mt-[40px]">{params.id}</div>
    <Tabs defaultActiveKey="1" className="mt-[40px]" items={items} />
  </div>
}
