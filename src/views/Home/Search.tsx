import React from "react";
import {
    FiSearch
} from 'react-icons/fi';
export default function Home() {

    return <section className="w-full h-280 bg-gray-dark">
        <div className="container mx-auto h-full pt-80 relative">
            <p className="text-xl text-white">The Blockchain Explorer</p>
            <div className="h-50 w-2/4 bg-white rounded-md flex items-center p-4 mt-10">
                <input type="text" className="flex-1 h-full appearance-none focus:outline-none focus:ring-2 focus:ring-light-gray focus:border-light-gray pl-20 pr-10 rounded-md" placeholder="Search by Address / Txn Hash / Block / Token / Domain Name" />
                <FiSearch className="cursor-pointer text-2xl w-50"></FiSearch>
            </div>
            <div className="absolute w-full h-100 rounded-md border border-light-gray bg-white translate-y-1/2 flex items-center justify-between p-40">
                <div>
                    <h2 className="text-2xl">Network Stats</h2>
                    <p className="text-sm text-gray">Network Stats BlockChain Mainnet is open to everyone.</p>
                </div>
                <div className="flex items-center">
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl text-gray"> Blocks</h2>
                        <h4 className="text-xl">10 752 264</h4>
                    </div>
                    <div className="h-30 w-1 bg-light-gray ml-20 mr-20"></div>
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl text-gray">Transactions</h2>
                        <h4 className="text-xl">10 752 264</h4>
                    </div>
                    <div className="h-30 w-1 bg-light-gray ml-20 mr-20"></div>
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl text-gray">Addresses</h2>
                        <h4 className="text-xl">10 752 264</h4>
                    </div>
                    <div className="h-30 w-1 bg-light-gray ml-20 mr-20"></div>
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl text-gray">TPS</h2>
                        <h4 className="text-xl">20/sec</h4>
                    </div>
                    <div className="h-30 w-1 bg-light-gray ml-20 mr-20"></div>
                    <div className="flex flex-col items-center">
                        <h2 className="text-xl text-gray">Gas Price</h2>
                        <h4 className="text-xl">1 GWEI</h4>
                    </div>

                </div>
            </div>
        </div>
    </section>
}