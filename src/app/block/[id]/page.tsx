import React from "react";
import Block from "@/views/block"
import { queryBlockDetail } from "@/api"
export default async function BlockServer({ params }: { params: { id: string } }) {

    // if (params.id.startsWith("0x")) {
    //     console.log("字符串以 '0x' 开头");
    //   } else {
    //     console.log("字符串不以 '0x' 开头");
    //   }
    const blockDetail = await queryBlockDetail(params.id)

    return <Block blockDetail ={blockDetail} />
}