import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
    RiArrowDropDownLine
} from 'react-icons/ri';
import { BsSun, BsMoon } from "react-icons/bs"


export default function Home() {

    return <div className="bg-white border-b border-off-white shadow-lg p-4">
        <header className="h-60 w-full flex items-center justify-between  container mx-auto">
            <Link href="/">
                <Image src="/images/next.svg" width="120" height={60} alt="" />
            </Link>
            <ul className="flex items-center h-full">
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
                {/* <li className="cursor-pointer hover:text-steel-blue flex items-center">
                    <BsSun className="ml-2 text-2xl" />
                    <BsMoon className="ml-2 text-xl" />
                </li> */}
            </ul>
        </header>
    </div>
}