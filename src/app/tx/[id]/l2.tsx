"use client";
import React, { useEffect, useMemo } from "react";
import Block from "@/views/block";
import useStore from "@/store";
import useSWR from "swr";
import { getTransactionsByHash } from "@/api";
import { Breadcrumb } from "antd";
import { shotSentTo, timeFormat } from "@/utils";
import { ITransactionsByOrderResponse } from "@/types";

export default function BlockServer({
  blockDetail,
}: {
  blockDetail: ITransactionsByOrderResponse;
}) {
  return (
    <div className="container mx-auto ">
      <div className=" rounded-md mt-20 border border-light-gray shadow-md p-20 bg-white">
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
          <div className="w-1/4">Version</div>
          <div>{blockDetail?.transaction.sequence_info.tx_order}</div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
          <div className="w-1/4">Status</div>
          {blockDetail?.execution_info.status.type}
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
          <div className="w-1/4">Sender</div>
          {blockDetail?.transaction.data.sender}
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
          <div className="w-1/4">Smart Contract</div>
          {blockDetail.transaction?.data?.action?.function_call?.function_id.split(
            "::"
          )[0] || ""}
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
          <div className="w-1/4">Function</div>
          {shotSentTo(blockDetail.transaction.data.action?.function_call?.function_id)}
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
          <div className="w-1/4">GasUsed</div>
          {(Number(blockDetail.execution_info?.gas_used) / 1e9 || 0).toFixed(6) ||
                  "0.0"}{" "}
                RGas
        </div>
      </div>
    </div>
  );
}
