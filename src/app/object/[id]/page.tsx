"use client";

import React, {ReactNode, useMemo} from "react";
import {useRouter} from "next/navigation"
import {useRoochClientQuery} from "@roochnetwork/rooch-sdk-kit";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {duotoneDark, duotoneLight} from "react-syntax-highlighter/dist/esm/styles/prism";

import {
  Box,
  Tab,
  Card,
  Chip,
  Tabs,
  Stack,
  Button,
  Divider,
  CardHeader,
  CardContent,
  useColorScheme, Skeleton
} from "@mui/material";

import {varAlpha} from "../../../theme/styles";
import {useTabs} from "../../../hooks/use-tabs";
import {Iconify} from "../../../components/iconify";
import {DashboardContent} from "../../../layouts/dashboard";
import ObjectDetail from "./object";

const TX_VIEW_TABS = [
  { label: 'Overview', value: 'overview' },
  { label: 'Raw JSON', value: 'raw' },
];
export default function Object ({ params }: { params: { id: string } }) {
  const tabs = useTabs('overview');
  const { mode } = useColorScheme();
  const router = useRouter()

  const { data, isPending } = useRoochClientQuery('queryObjectStates' as any, {
    filter: {
      object_id: params.id,
    },
  } as any);



  const objectDetail = useMemo(() => {
    return data?.data
  }, [data]);


  const renderTabs = (
    <Tabs value={tabs.value} onChange={tabs.onChange} sx={{ mb: { xs: 2, md: 2 } }}>
      {TX_VIEW_TABS.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </Tabs>
  );

  return <DashboardContent maxWidth="xl">
    <Button
      className="w-fit"
      onClick={() => {
        router.back();
      }}
      startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
    >
      Back
    </Button>
    <Card className="mt-4">
      <CardHeader title="Object" subheader={params.id} sx={{ mb: 3 }} />

      <Divider />

      <CardContent className="!pt-0">
        {renderTabs}
        {tabs.value === 'overview' && (
          objectDetail?.map(item=> <ObjectDetail object={item}/>)
        )}
        {tabs.value === 'raw' && (
          <Stack>
            <SyntaxHighlighter
              language="json"
              style={  mode ==='light' ? duotoneLight : duotoneDark}
              customStyle={{
                whiteSpace: 'pre-wrap',
                width: '100%',
                borderRadius: '8px',
                wordBreak: 'break-all',
                overflowWrap: 'break-word',
              }}
              wrapLines
              wrapLongLines
            >
              {JSON.stringify(objectDetail, null, 2)}
            </SyntaxHighlighter>
          </Stack>
        )}
      </CardContent>
    </Card>
  </DashboardContent>
}


function PropsKeyItem({ itemKey }: { itemKey: string }) {
  return <Box className="w-48 text-sm font-semibold text-gray-600">{itemKey}</Box>;
}

function PropsValueItem({ children, loading }: { children: ReactNode; loading?: boolean }) {
  if (loading) {
    return <Skeleton width="160px" height="16px" />;
  }
  return children;
}
