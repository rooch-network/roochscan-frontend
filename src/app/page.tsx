import React, {useEffect} from "react";
import Search from "@/views/Home/Search";
import DataView from "@/views/Home/DataView";
import {getObjectById} from "@/api";


export default function Home() {
    return <main className="mt-[70px]">
        <Search />
        <DataView />
    </main>
}
