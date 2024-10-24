import React from "react";
import Search from "@/views/Home/Search";
import DataView from "@/views/Home/DataView";


export default function Home() {

    return <main className="w-full h-full mt-[70px]">
        <Search />
        <DataView />
    </main>
}