"use client";
import React, { useEffect, useMemo } from "react";
import Block from "@/views/block";
import useStore from "@/store";
import useSWR from "swr";
import { getTransactionsByHash, queryBalance, queryBalances } from "@/api";
import { Breadcrumb } from "antd";
import { timeFormat } from "@/utils";
import { formatUnits } from "viem";
import {useRouter} from "next/navigation"
import Image from "next/image";
export default function BlockServer({ params }: { params: { id: string } }) {
  const { roochNodeUrl } = useStore();
  const router = useRouter()
  const { data } = useSWR(
    params.id ? [roochNodeUrl, params.id] : null,
    ([key, tx]) => queryBalance(tx),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );
  const { data: balanceData } = useSWR(
    params.id ? ["getBalances", params.id] : null,
    ([key, tx]) => queryBalances(tx),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      refreshInterval: 0,
    }
  );

  useEffect(() => {
    console.log("balanceData:---------", balanceData?.result.data);
  }, [balanceData]);
  // getTransactionsByHash
  if (params.id.startsWith("0x")) {
    console.log("字符串以 '0x' 开头");
  } else {
    console.log("字符串不以 '0x' 开头");
  }
  const handleRouteHome = () =>{
    router.push("/")
  }
  return (
    <div className="container mx-auto mt-[80px]">
      <Breadcrumb
      className="cursor-pointer"
        items={[
          {
            title: "Home",
            onClick:handleRouteHome
          },

          {
            title: "Assets",
          },
        ]}
      />
      <div className=" rounded-md mt-20 border border-light-gray shadow-md p-20 bg-white">
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
          <div className="w-1/4">balance</div>
          <div>{data?.result?.balance}</div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
          <div className="w-1/4">coin_type</div>
          <div>{data?.result?.coin_type}</div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
          <div className="w-1/4">decimals</div>
          <div>{data?.result?.decimals}</div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
          <div className="w-1/4">name</div>
          <div>{data?.result?.name}</div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
          <div className="w-1/4">supply</div>
          <div>{data?.result?.supply}</div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
          <div className="w-1/4">symbol</div>
          <div>{data?.result?.symbol}</div>
        </div>
      </div>
      {balanceData?.result.data.map((v, index) => (
        <div
          key={index}
          className=" rounded-md mt-20 border border-light-gray shadow-md p-20 bg-white"
        >
          <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">coin_type</div>
            <div>{v.coin_type}</div>
          </div>
          <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">balance</div>
            <div>
              {formatUnits(BigInt(v.balance), Number(v.decimals))} {v.symbol}
            </div>
          </div>

          <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">name</div>
            <div>{v.name}</div>
          </div>
          <div className="flex item-center border-b border-light-gray pt-15 pb-15">
            <div className="w-1/4">supply</div>
            <div>{v.supply}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
