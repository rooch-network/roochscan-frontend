"use client";
import React, {useMemo} from "react";
import {Breadcrumb, Tabs, TabsProps} from "antd";
import {useRouter} from "next/navigation"
import ObjectDetail from "@/app/object/[id]/object";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {duotoneLight,dark} from "react-syntax-highlighter/dist/esm/styles/prism";
import useStore from "@/store";
import useSWR from "swr";
import {getABIByPKGId} from "@/api";
import {IModule} from "@/types";
import ModuleDetail from "@/app/module/[id]/moduleDetail";
import useDarkMode from "@/hooks/useDarkMode";

interface PageProps {
  params: {
    id: string;
  };
  searchParams?: { [key: string]: string | string[] | undefined };
}

interface ModulePageProps extends PageProps {
  hideHeader?: boolean;
}

const ModulePage: React.FC<ModulePageProps> = ({ params, hideHeader }) => {
  const id = decodeURIComponent(params.id);
  const router = useRouter()
  const isDarkMode = useDarkMode()

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
      label: <div className="dark:text-white">Overview</div>,
      children:<ModuleDetail moduleDetail={moduleDetail}/>,
    },
    {
      key: "2",
      label: <div className="dark:text-white"> Raw JSON</div>,
      children: (
        <SyntaxHighlighter
          language="json"
          style={ isDarkMode? dark :duotoneLight }
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


  return <div className={`container mx-auto ${hideHeader ?? "mt-[80px]"}`}>
    {
      !hideHeader && <Breadcrumb
        className="cursor-pointer"
        items={[
          {
            title:<div className="dark:text-white">Home</div>,
            onClick:handleRouteHome
          },

          {
            title:  <div className="dark:text-white">Object</div>,
          },
        ]}
      />
    }
    <div className={` ${hideHeader ?? "pc:mt-[40px] mt-[20px]"} dark:text-white`}>{id}</div>
    <Tabs defaultActiveKey="1" className="pc:mt-[40px] mt-[20px]" items={items} />
  </div>
}

export default ModulePage;
