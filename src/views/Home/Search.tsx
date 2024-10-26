"use client";
import React, {useState, useCallback} from "react";
import { useRouter } from "next/navigation";
import {Card, Col, Input, Popover, Row, Statistic} from "antd";
import {LoadingOutlined, SearchOutlined} from "@ant-design/icons";
import {getObjectById, getTransactionsByHash, queryBalance, queryBalances} from "@/api";
import debounce from "lodash/debounce";

export default function Home() {
  const [val, setVal] = useState("");
  const router = useRouter();
  const [addressType, setAddressType] = useState<"assets"  | "tx" | "object" | "none">("none");
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false)


  const handleInput = (e:string) => {
    const value = e;
    setVal(value);
    setAddressType("none");
    setNotFound(false);
    debouncedQueryObjectOrTx(value); // 调用防抖函数
  };


  const queryObjectOrTx = async (id: string) => {
    if(!id) return;
    if(loading) return;
    setLoading(true);
    try{
      let haveData = false;
      if(id.startsWith("rooch")){
        const res = await queryBalances(id)
        if(res.result.data.length > 0 && res.result.data[0]){
          setAddressType("assets")
          haveData = true;
        }
      } else {
        const tx = await getTransactionsByHash(id)
        if(tx.result.length > 0 && tx.result[0]){
          setAddressType("tx")
          haveData = true;
        } else {
          const object = await getObjectById(id);
          if(object.result.data && object.result.data.length > 0 && object.result.data[0]){
            setAddressType("object")
            haveData = true;
          }
        }
      }

      if(!haveData){
        setNotFound(true)
      }

    } catch (e){
      setNotFound(true)
      console.log(e, "network error")
    }
    setLoading(false)

  };

  const debouncedQueryObjectOrTx = useCallback(debounce(queryObjectOrTx, 300), []);

  const handleEnter = () => {
    if(loading) return;
    if(addressType !== "none"){
      router.push(`${addressType}/${val}`);
      return;
    }
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
            onPressEnter={(e:React.KeyboardEvent<HTMLInputElement>)=>{
              queryObjectOrTx(val)
            }}
            onChange={(e) => handleInput(e.target.value.trim())} // 调用防抖输入处理
            value={val}
            prefix={<SearchOutlined className=" text-[20px]" />}
            type="text"
            className="h-50 w-full bg-white border border-[#e4e4e7] flex items-center p-4 mt-40 focus:outline-none focus:ring-2 focus:ring-light-gray focus:border-light-gray hover:border-light-gray pl-20 pr-10 rounded-md"
            placeholder="Search by Address / Txn Hash / Block / Token / Domain Name"
          />
        </Popover>
        <div>
          {
            loading ? <LoadingOutlined></LoadingOutlined> : notFound && val ? <div className={"px-2 text-[#ff0000] text-[14px]"}>Not Found</div> : <div/>
          }
        </div>
      </div>
    </section>
  );
}
