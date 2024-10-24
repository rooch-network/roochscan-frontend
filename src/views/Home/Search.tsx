"use client";
import React, { useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { Card, Col, Row, Select, Statistic } from "antd";
export default function Home() {
  const [val, setVal] = useState("");
  const [select, setSelect] = useState("hash");
  const router = useRouter();
  const handleInput = (e: any) => {
    const val = e.target.value.trim();
    setVal(val);
  };
  const handleEnter = (event: any) => {
    if (event.key === "Enter") {
      if (select == "hash") {
        if (val.startsWith("0x") && val.length === 66) {
          router.push(`block/${val}`);
        }
      } else {
        router.push(`assets/${val}`);
      }
    }
  };
  const handleChange = (value: string) => {
    console.log(`selected ${value}`);
    setSelect(value);
  };
  return (
    <section className="w-full ">
      <div className="container mx-auto h-full  relative">
        <p className=" text-[30px] font-semibold mt-[40px]  text-black">
          Rooch Explorer
        </p>

        <Row gutter={16} className=" mt-[40px]">
          <Col span={6}>
            <Card bordered={false}>
              <Statistic title="Blocks" value={107523} precision={2} />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false}>
              <Statistic title="Transactions" value={112893} precision={2} />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false}>
              <Statistic title="Addresses" value={10752264} precision={2} />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false}>
              <Statistic title="Tps" value={20} precision={0} suffix="/sec" />
            </Card>
          </Col>
        </Row>
        <div className="h-50 w-2/4 bg-white rounded-md flex items-center p-4 mt-40">
          <input
            onKeyPress={handleEnter}
            value={val}
            onChange={handleInput}
            type="text"
            className="flex-1 h-full appearance-none focus:outline-none focus:ring-2 focus:ring-light-gray focus:border-light-gray pl-20 pr-10 rounded-md"
            placeholder="Search by Address / Txn Hash / Block / Token / Domain Name"
          />
          <Select
            defaultValue="hash"
            style={{ width: 120 }}
            value={select}
            onChange={handleChange}
            options={[
              { value: "assets", label: "资产查询" },
              { value: "hash", label: "哈希查询" },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
