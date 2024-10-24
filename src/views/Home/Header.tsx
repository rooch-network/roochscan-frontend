"use client"
import React, { useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import { getRoochNodeUrl } from '@roochnetwork/rooch-sdk';
import useStore from "@/store"

const defaultMainnetUrl = "https://main-seed.rooch.network"
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
    const { roochNodeUrl, setRoochNodeUrl } = useStore()
    const mapNetName = useMemo(()=> Object.keys(NetWork).find((item:any) => NetWork[item] === roochNodeUrl),[roochNodeUrl])
    const handleDropDownClick: MenuProps['onClick'] = ({ key }) => {
        setRoochNodeUrl(key)
    }
    return <div className="bg-white border-b border-off-white shadow-lg p-4">
        <header className="h-60 w-full flex items-center justify-between  container mx-auto">
            <Link href="/">
                <Image src="/images/logo.png" width="120" height={60} alt="" />
            </Link>
            <Dropdown menu={{ items, onClick: handleDropDownClick, selectedKeys: [roochNodeUrl], defaultSelectedKeys: [roochNodeUrl] }} arrow placement="bottom">
                <div className=" cursor-pointer" onClick={(e) => e.preventDefault()}>
                    <Space>
                        {mapNetName} netWork
                    </Space>
                </div>
            </Dropdown>
            {/* <ul className="flex items-center h-full">
                <li className="mr-30 relative hover:text-steel-blue group">
                    <div className="cursor-pointer flex items-center hover:text-steel-blue">
                        <span>
                            Blockchain
                        </span>
                        <RiArrowDropDownLine className="ml-2 text-2xl hover:text-steel-blue" />
                    </div>
                    <ul className="absolute group-hover:block w-224 bg-white translate-y-1 p-10 shadow-lg shadow-cyan-500/50 rounded-md border border-gray hidden z-10">
                        <li className="text-sm p-4 pl-10 mb-5 cursor-pointer hover:bg-light-gray rounded-md h-full text-black">
                            Transactions
                        </li>
                        <li className="text-sm p-4 pl-10 cursor-pointer hover:bg-light-gray rounded-md h-full text-black">
                            Pending Transactions
                        </li>
                        <li className="text-sm p-4 pl-10 mb-5  cursor-pointer hover:bg-light-gray rounded-md h-full text-black">
                            Blocks
                        </li>
                    </ul>
                </li>
                <li className="mr-30 relative hover:text-steel-blue group">
                    <div className="cursor-pointer flex items-center hover:text-steel-blue">
                        <span>
                            Tools
                        </span>
                        <RiArrowDropDownLine className="ml-2 text-2xl hover:text-steel-blue" />
                    </div>
                    <ul className="absolute group-hover:block w-224 bg-white translate-y-1 p-10 shadow-lg shadow-cyan-500/50 rounded-md border border-gray hidden z-10">
                        <li className="text-sm p-4 pl-10 mb-5 cursor-pointer hover:bg-light-gray rounded-md h-full text-black">
                            <a href="https://bscscan.com/unitconverter" target="_blank" rel="noopener noreferrer">
                                unit Converter
                            </a>
                        </li>

                    </ul>
                </li>
            </ul> */}
        </header>
    </div>
}