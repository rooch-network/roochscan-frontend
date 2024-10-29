"use client";
import React, {useMemo} from "react";
import {Breadcrumb, Tabs, TabsProps} from "antd";
import {useRouter} from "next/navigation"
import ObjectDetail from "@/app/object/[id]/object";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {duotoneLight} from "react-syntax-highlighter/dist/esm/styles/prism";
import useStore from "@/store";
import useSWR from "swr";
import {getABIByPKGId} from "@/api";
import {IModule} from "@/types";
import ModuleDetail from "@/app/module/[id]/moduleDetail";


const ModulePage = ({ params }: { params: { id: string } }) =>{
  const id = decodeURIComponent(params.id);
  const router = useRouter()

  const { roochNodeUrl } = useStore();
  const { data } = useSWR(
    params.id ? [roochNodeUrl, params.id] : null,
    ([key, tx]) => {
      const [moduleId, moduleName] = id.split("::");
      return getABIByPKGId(moduleId, moduleName)
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );

  const moduleDetail:IModule = useMemo(() => {
    return data?.result as IModule;
  }, [data]);

  const handleRouteHome = () =>{
    router.push("/")
  }

  const items: TabsProps["items"] = [
    {
      key: "1",
      label: "Overview",
      children:<ModuleDetail moduleDetail={moduleDetail}/>,
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
          { JSON.stringify(moduleDetail, null, 2)}
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
    <div className="pc:mt-[40px] mt-[20px]">{id}</div>
    <Tabs defaultActiveKey="1" className="pc:mt-[40px] mt-[20px]" items={items} />
  </div>
}

export default ModulePage;
