"use client";
import React, { useEffect } from "react";
import DataList from "@/components/DataList";
import useStore from "@/store";
import { queryBlockList } from "@/api/index";
import useSWR from "swr";
import { BlockType, ITransactionsByOrderResponse } from "@/types";
import { Table, TableProps, Tag, Tooltip } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { getTokenShortHash, timeFormat } from "@/utils";
import { Button, message, Space } from "antd";
import Copy from "copy-to-clipboard";
import {useRouter} from "next/navigation"
export default function DataView() {
  const { roochNodeUrl } = useStore();
  const router = useRouter()
  const { data } = useSWR(roochNodeUrl, () => queryBlockList([null, 10]),{refreshInterval: 3500});
  useEffect(() => {
    console.log("blocks:---------", data);
  }, [data]);

  const handleCopy = (v: string) => {
    Copy(v);
    message.open({
      type: "success",
      content: "Copy Success",
    });
  };

  const handleRouter = (tx_hash:string) =>{
    router.push(`/tx/${tx_hash}`)
  }

  return (
    <div className="mt-20 container mx-auto ">
      <div className="w-[100%] rounded-lg">
        <div className="p-20">
          <span className="font-semibold">Last Transactions</span>
        </div>
      </div>
      <div className="w-full">
        <div className=" w-full flex items-center mb-[20px]">
          <div className="w-[20%] text-center">Version</div>
          <div className="w-[20%] text-center">Timestamp</div>
          <div className="w-[20%] text-center">Sender</div>
          <div className="w-[20%] text-center">Sent To</div>
          <div className="w-[20%] text-center">Function</div>
          <div className="w-[20%] text-center">Amount</div>
        </div>
        { Array.isArray(data?.result?.data) && data?.result?.data?.map((v) => (
          <div
          onClick={() =>handleRouter(v.execution_info.tx_hash || "")}
            key={v.execution_info?.tx_hash || "1"}
            className=" w-full flex items-center mb-[10px] bg-[#fafafa] hover:bg-[#f7f7f7] h-[50px] rounded-md cursor-pointer"
          >
            <div className="w-[20%] text-center text-[#03aeb2] text-[14px]">
              {v.transaction.sequence_info.tx_order}
            </div>
            <div className="w-[20%] text-center text-[#121615]">
              {timeFormat(
                Number(v.transaction.sequence_info.tx_timestamp) || 0
              )}
            </div>
            <div className="w-[20%] text-center flex justify-center items-center">
              <div
                className="bg-[#c6e7f3] px-[5px] text-[#0faae4] cursor-pointer rounded-md"
                onClick={(e) => {
                    e.stopPropagation();
                    handleCopy(v.transaction.data.sender)
                }}
              >
                <Tooltip title={v.transaction.data.sender}>
                  <span>{getTokenShortHash(v.transaction.data.sender)}</span>
                </Tooltip>

                <CopyOutlined className="ml-[5px]" />
              </div>
            </div>
            <div className="w-[20%] text-center flex justify-center items-center">
              <div
                className="bg-[#c6e7f3] px-[5px] text-[#0faae4] cursor-pointer rounded-md"
                onClick={(e) =>
                {
                    e.stopPropagation();
                  handleCopy(
                    v.transaction.data.action?.function_call?.function_id
                  )
                }
                }
              >
                <Tooltip
                  title={v.transaction.data.action?.function_call?.function_id}
                >
                  <span>
                    {getTokenShortHash(
                      v.transaction.data.action?.function_call?.function_id
                    )}
                  </span>
                </Tooltip>

                <CopyOutlined className="ml-[5px]" />
              </div>
            </div>
            <div className="w-[20%] text-center flex justify-center items-center">
              <div className="bg-[#c6e7f3] px-[5px] text-[#0faae4] cursor-pointer rounded-md">
                {v.transaction.data.action_type}
              </div>
            </div>
            <div className="w-[20%] text-center">
              {v.execution_info?.gas_used || "0"}
            </div>
          </div>
        ))}
      </div>

      {/* <DataList blocks={data?.result?.data || []} type={BlockType.Block} isAll  /> */}
    </div>
  );
}
