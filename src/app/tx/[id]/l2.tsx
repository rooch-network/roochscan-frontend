"use client";
import React, {useEffect, useMemo, useState} from "react";
import Block from "@/views/block";
import useStore from "@/store";
import useSWR from "swr";
import {getABIByPKGId, getTransactionsByHash} from "@/api";
import {Breadcrumb, Form, Input} from "antd";
import { shotSentTo, timeFormat } from "@/utils";
import {FunctionDetail, IModule, ITransactionsByOrderResponse} from "@/types";
import ModulePage from "@/app/module/[id]/page";


function convertToFunctionDetailMap(functions?: FunctionDetail[]): Map<string, FunctionDetail> {
  if(!functions){
    return new Map<string, FunctionDetail>();
  }
  const functionDetailMap = new Map<string, FunctionDetail>();
  functions!.forEach((func) => {
    functionDetailMap.set(func.name, func);
  });
  return functionDetailMap;
}

export default function BlockServer({
  blockDetail,
}: {
  blockDetail: ITransactionsByOrderResponse;
}) {


  console.log(blockDetail, "blockDetail")

  const [moduleDetail, setModuleDetail] = useState<IModule>();

  useEffect(()=>{
    getModule().then();
  }, [])


  const getModule = async () =>{
    const [moduleId, moduleName] = blockDetail.transaction.data.action.function_call.function_id.split("::");
    const res = await getABIByPKGId(moduleId, moduleName);
    console.log(res, "getTypeByIndexgetTypeByIndexgetTypeByIndex")
    setModuleDetail(res.result)
  }

  const funcMap = useMemo(()=>{
    return convertToFunctionDetailMap(moduleDetail?.functions)
  }, [moduleDetail])

  const functionName = () =>{
    const names = blockDetail.transaction.data.action.function_call.function_id.split("::");
    return names[names.length - 1]
  }

  const getTypeByIndex = (index) =>{
    if(moduleDetail && funcMap.size > 0){
      return funcMap.get(functionName()).params[index]
    }
  }

  return (
    <div className="container mx-auto flex">
      <div className=" rounded-md mt-20 border border-light-gray shadow-md p-20 bg-white dark:bg-[#0d1728]">
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
          <div className="w-1/4">Version</div>
          <div>{blockDetail?.transaction.sequence_info.tx_order}</div>
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
          <div className="w-1/4">Status</div>
          {blockDetail?.execution_info.status.type}
        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15 ">
          <div className="w-1/4">Sender</div>
          <div className=" w-3/4 break-words">
          {blockDetail?.transaction.data.sender}
          </div>

        </div>
        <div className="flex item-center border-b border-light-gray pt-15 pb-15">
          <div className="w-1/4">Smart Contract</div>
          <div className=" w-3/4 break-words">
          {blockDetail.transaction?.data?.action?.function_call?.function_id.split(
            "::"
          )[0] || ""}
          </div>

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
      <div className={"rounded-md w-full ml-20 mt-20 border border-light-gray shadow-md p-20 bg-white dark:bg-[#0d1728] "}>
        {/*<ModulePage hideHeader params={{*/}
        {/*  id:blockDetail.transaction.data.action.function_call.function_id.split("::")[0]+"::"+blockDetail.transaction.data.action.function_call.function_id.split("::")[1]*/}
        {/*}}></ModulePage>*/}
        <div className={"mb-20 dark:text-white"}>Params</div>
        <Form
          className={"w-full"}>
          <div>
            {
              blockDetail.transaction.data.action.function_call.args.map((item, index) =>{
                return  <Form.Item
                  key={item}
                  name={item}
                  label={<div className="dark:text-white">{getTypeByIndex(index)}</div>}
                >
                  <Input disabled placeholder={item} className="dark:text-white dark:bg-dark-gray" key={item}></Input>
                </Form.Item>
              })
            }
          </div>
        </Form>

      </div>
    </div>
  );
}
