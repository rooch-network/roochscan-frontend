"use client";
import React, { useState, useCallback } from "react";
import { FiSearch } from "react-icons/fi";
import { useRouter } from "next/navigation";
import {Card, Col, Input, Popover, Row, Statistic} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import {getObjectById, getTransactionsByHash, queryBalance, queryBalances} from "@/api";
import debounce from "lodash/debounce";

export default function Home() {
  const [val, setVal] = useState("");
  const router = useRouter();
  const [addressType, setAddressType] = useState<"assets"  | "tx" | "object" | "none">("none");
  const [loading, setLoading] = useState(false)


  const handleInput = (e) => {
    const value = e;
    setVal(value);
    setAddressType("none");
    debouncedQueryObjectOrTx(value); // 调用防抖函数
  };


  // 防抖函数，只在用户停止输入后调用
  const debouncedQueryObjectOrTx = debounce(async (objectId: string) => {
    await queryObjectOrTx(objectId);
  }, 300); // 300毫秒的防抖时间

  const handleEnter = () => {
    if(loading) return;
    if(addressType !== "none"){
      router.push(`${addressType}/${val}`);
      return;
    }
  };

  const queryObjectOrTx = async (id: string) => {
    setLoading(true);
    try{
      if(id.startsWith("rooch")){
        const res = await queryBalances(id)
        if(res.result.data.length > 0 && res.result.data[0]){
          setAddressType("assets")
        }
      } else {
        const tx = await getTransactionsByHash(id)
        if(tx.result.length > 0 && tx.result[0]){
          setAddressType("tx")
        } else {
          const object = await getObjectById(id);
          if(object.result.data && object.result.data.length > 0){
            setAddressType("object")
          }
        }
      }
    } catch (e){
      console.log(e, "network error")
    }
    setLoading(false)

  };

  const content = (
    <div className={"w-[700px]"}>
      <div onClick={handleEnter} className={"cursor-pointer py-10 px-10  rounded hover:bg-[#66666620]"}> {addressType}: {val}</div>
    </div>
  );

  return (
    <section className="w-full ">
      <div className="container mx-auto h-full  relative">
        <p className=" text-[30px] font-semibold mt-[40px]  text-black">
          Rooch Explorer
        </p>

        <Row gutter={16} className=" mt-[40px]">
          <Col span={6}>
            <Card bordered={false} style={{ backgroundColor: "#f4f4f5" }}>
              <Statistic title="Blocks" value={107523} precision={2} />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ backgroundColor: "#f4f4f5" }}>
              <Statistic title="Transactions" value={112893} precision={2} />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ backgroundColor: "#f4f4f5" }}>
              <Statistic title="Addresses" value={10752264} precision={2} />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ backgroundColor: "#f4f4f5" }}>
              <Statistic title="Tps" value={20} precision={0} suffix="/sec" />
            </Card>
          </Col>
        </Row>
        <Popover content={content} open={addressType !== "none"} arrow={false} placement="bottomLeft">
          <Input
            onKeyPress={handleEnter}
            onChange={(e) => handleInput(e.target.value.trim())} // 调用防抖输入处理
            value={val}
            prefix={<SearchOutlined className=" text-[20px]" />}
            type="text"
            className="h-50 w-full bg-white border border-[#e4e4e7] flex items-center p-4 mt-40 focus:outline-none focus:ring-2 focus:ring-light-gray focus:border-light-gray hover:border-light-gray pl-20 pr-10 rounded-md"
            placeholder="Search by Address / Txn Hash / Block / Token / Domain Name"
          />
        </Popover>
      </div>
    </section>
  );
}
