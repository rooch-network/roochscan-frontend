"use client"
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import { getRoochNodeUrl } from '@roochnetwork/rooch-sdk';
import useStore from "@/store"
import { DownOutlined, UpOutlined } from '@ant-design/icons';

const defaultMainnetUrl = process.env.NEXT_PUBLIC_DEFAULT_NETWORK
const  NetWork:any = {
    Mainnet :defaultMainnetUrl,
    Testnet:getRoochNodeUrl('testnet'),
    Devnet:getRoochNodeUrl('devnet'),
    Localnet:getRoochNodeUrl('localnet'),
}
const items: MenuProps['items'] = [
    {
        key:NetWork.Mainnet,
        label: (
            <div>
                <p className="text-[#2f2f2f] font-bold ">Mainnet</p>
                <p className="text-[#198ffd] text-sm">{NetWork.Mainnet}</p>
            </div>
        ),
    },
    {
        key: NetWork.Testnet,
        label: (
            <div>
                <p className="text-[#2f2f2f] font-bold ">Testnet</p>
                <p className="text-[#198ffd] text-sm">{NetWork.Testnet}</p>
            </div>
        ),
    },
    {
        key: NetWork.Devnet,
        label: (
            <div>
                <p className="text-[#2f2f2f] font-bold">Devnet</p>
                <p className="text-[#198ffd] text-sm">{NetWork.Devnet}</p>
            </div>
        ),
    },
    {
        key: NetWork.Localnet,
        label: (
            <div>
                <p className="text-[#2f2f2f] font-bold">Localnet</p>
                <p className="text-[#198ffd] text-sm">{NetWork.Localnet}</p>
            </div>
        ),
    }
];

export default function Header() {
    const [dropdownVisible, setDropdownVisible] = useState(false);

    const handleVisibleChange = (flag:boolean) => {
        setDropdownVisible(flag); // 更新 dropdown 的可见状态
      };
    const { roochNodeUrl, setRoochNodeUrl } = useStore()
    const mapNetName = useMemo(()=> Object.keys(NetWork).find((item:any) => NetWork[item] === roochNodeUrl),[roochNodeUrl])
    const handleDropDownClick: MenuProps['onClick'] = ({ key }) => {
        setRoochNodeUrl(key)
        setDropdownVisible(false)
    }
    return <header className="h-60 w-full flex items-center justify-between  px-[20px] fixed top-[0px] bg-white z-10">
    <Link href="/">
        <Image src="/images/logo.png" width="120" height={60} alt="" />
    </Link>
    <Dropdown  onVisibleChange={handleVisibleChange}  className="border p-[5px] rounded-lg border-gray-light" menu={{ items, onClick: handleDropDownClick, selectedKeys: [roochNodeUrl], defaultSelectedKeys: [roochNodeUrl] }} arrow placement="bottom">
        <div className=" cursor-pointer text-[15px]" onClick={(e) => e.preventDefault()}>
            <Space>
                {mapNetName} netWork
               {!dropdownVisible ? <DownOutlined className="text-[14px]" /> : <UpOutlined className="text-[14px]" />}  
                
            </Space>
        </div>
    </Dropdown>
</header>
}