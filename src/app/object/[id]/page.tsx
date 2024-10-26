"use client";
import React, {useMemo} from "react";
import {Breadcrumb, Tabs, TabsProps} from "antd";
import {useRouter} from "next/navigation"
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {duotoneLight} from "react-syntax-highlighter/dist/esm/styles/prism";
import useSWR from "swr";
import {getObjectById, getTransactionsByHash} from "@/api";
import useStore from "@/store";
import ObjectDetail from "@/app/object/[id]/object";


export default function Object ({ params }: { params: { id: string } }) {
  const router = useRouter()
  const handleRouteHome = () =>{
    router.push("/")
  }
  const { roochNodeUrl } = useStore();
  const { data } = useSWR(
    params.id ? [roochNodeUrl, params.id] : null,
    ([key, tx]) => getObjectById(tx),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );
  const objectDetail = useMemo(() => {
    return data?.result.data;
  }, [data]);
  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Overview",
      children:<div>
        {
          objectDetail?.map(item=>{
            return <ObjectDetail object={item}></ObjectDetail>
          })
        }
      </div>,
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
           { JSON.stringify(objectDetail, null, 2)}
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
