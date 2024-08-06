'use client'
import React, { useEffect } from "react";

import { Breadcrumb, Card, Col, Row } from 'antd';
import useStore from "@/store"
import { queryBlockList } from "@/api/index"
import useSWR from "swr";
import DataList from "@/components/DataList";
import { BlockType } from "@/types";

export default function AllBlock() {
    const { roochNodeUrl } = useStore()
    const { data } = useSWR(roochNodeUrl, () => queryBlockList([20,null]))
    return <div className=" mt-[80px] container mx-auto ">
        <Breadcrumb
            items={[
                {
                    title: 'Home',
                },

                {
                    title: 'Blocks',
                },
            ]}
        />
        <Row gutter={16} className=" mt-10">
            <Col span={6}>
                <Card title="Network Utilization (24H)" bordered={false}>
                    50%
                </Card>
            </Col>
            <Col span={6}>
                <Card title="Last Safe Block" bordered={false}>
                    20467797
                </Card>
            </Col>
            <Col span={6}>
                <Card title="PRODUCED BY MEV BUILDERS (24H)" bordered={false}>
                    92.5%
                </Card>
            </Col>
            <Col span={6}>
                <Card title="Burnt Fees 🔥" bordered={false}>
                    4360138ETH
                </Card>
            </Col>
        </Row>
        <div className="mt-20 container mx-auto flex justify-between">
            <DataList blocks={data?.result?.data || []} type={BlockType.Block} />
        </div>
    </div>

}