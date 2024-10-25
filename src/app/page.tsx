'use client'
import React, {useEffect} from "react";
import Search from "@/views/Home/Search";
import DataView from "@/views/Home/DataView";
import {getObjectById} from "@/api";


export default function Home() {

  useEffect(()=>{
    (async ()=>{
      let objId = "0x018316bdaf22b346fcbe43dab84faab08d039cf753a08342164150afcab718c1d2"
      const res = await getObjectById(objId);
      console.log(objId,  res, "getObject res")
    })()
  }, [])

    return <main className=" mt-[70px]">
        <Search />
        <DataView />
    </main>
}
