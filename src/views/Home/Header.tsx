"use client"
import React, { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import type { MenuProps } from 'antd';
import { Dropdown, Space } from 'antd';
import { getRoochNodeUrl } from '@roochnetwork/rooch-sdk';
import useStore from "@/store"
import useChainID from "@/hooks/useChainID"
const items: MenuProps['items'] = [
    {
        key: getRoochNodeUrl('testnet'),
        label: (
            <div>
                <p className="text-[#2f2f2f] font-bold ">Testnet</p>
                <p className="text-[#198ffd] text-sm">{getRoochNodeUrl('testnet')}</p>
            </div>
        ),
    },
    {
        key: getRoochNodeUrl('devnet'),
        label: (
            <div>
                <p className="text-[#2f2f2f] font-bold">Devnet</p>
                <p className="text-[#198ffd] text-sm">{getRoochNodeUrl('devnet')}</p>
            </div>
        ),
    },
    {
        key: getRoochNodeUrl('localnet'),
        label: (
            <div>
                <p className="text-[#2f2f2f] font-bold">Localnet</p>
                <p className="text-[#198ffd] text-sm">{getRoochNodeUrl('localnet')}</p>
            </div>
        ),
    }
];

export default function Header() {
    const { roochNodeUrl, setRoochNodeUrl } = useStore()
    const chainID = useChainID()
    useEffect(() => {
        console.log(chainID, 'roochNodeUrl');
    }, [roochNodeUrl, chainID])
    const handleDropDownClick: MenuProps['onClick'] = ({ key }) => {
        setRoochNodeUrl(key)
    }
    return <div className="bg-white border-b border-off-white shadow-lg p-4">
        <header className="h-60 w-full flex items-center justify-between  container mx-auto">
            <Link href="/">
                <Image src="/images/next.svg" width="120" height={60} alt="" />
            </Link>
            <Dropdown menu={{ items, onClick: handleDropDownClick, selectedKeys: [roochNodeUrl], defaultSelectedKeys: [roochNodeUrl] }} arrow placement="bottom">
                <div className=" cursor-pointer" onClick={(e) => e.preventDefault()}>
                    <Space>
                        switch network
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