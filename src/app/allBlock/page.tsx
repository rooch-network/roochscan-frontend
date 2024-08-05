import React from "react";
import { Breadcrumb, Card, Col, Row } from 'antd';
export default function AllBlock() {

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
            <Col span={8}>
                <Card title="Card title" bordered={false}>
                    Card content
                </Card>
            </Col>
            <Col span={8}>
                <Card title="Card title" bordered={false}>
                    Card content
                </Card>
            </Col>
            <Col span={8}>
                <Card title="Card title" bordered={false}>
                    Card content
                </Card>
            </Col>
        </Row>
    </div>

}