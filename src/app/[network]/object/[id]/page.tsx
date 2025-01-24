'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTabs } from '@/hooks/use-tabs';
import { Iconify } from '@/components/iconify';
import { DashboardContent } from '@/layouts/dashboard';
import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneDark, duotoneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { ModuleView } from '@/components/module/module-view';
import { Form, Input, message } from 'antd';

import {
  Tab,
  Card,
  Tabs,
  Stack,
  Button,
  Divider,
  CardHeader,
  CardContent,
  useColorScheme,
} from '@mui/material';

import ObjectDetail from './object';

const TX_VIEW_TABS = [
  { label: 'Overview', value: 'overview' },
  { label: 'Module', value: 'module' },
  { label: 'Raw JSON', value: 'raw' },
];

export default function Object({ params }: { params: { id: string } }) {
  const tabs = useTabs('overview');
  const { mode } = useColorScheme();
  const router = useRouter();
  const [moduleName, setModuleName] = useState<string>();
  const [inputModuleName, setInputModuleName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const isDark = mode === 'dark';

  const { data, isPending } = useRoochClientQuery(
    'queryObjectStates' as any,
    {
      filter: {
        object_id: params.id,
      },
    } as any
  );

  const { data: moduleData, refetch: fetchModule } = useRoochClientQuery('getModuleAbi', {
    moduleAddr: params.id,
    moduleName: inputModuleName,
  }, {
    enabled: false,
  });

  const objectDetail = useMemo(() => data?.data, [data]);

  const handleSubmitModuleName = async () => {
    setIsLoading(true);
    try {
      const result = await fetchModule();
      if (result) {
        setModuleName(inputModuleName);
      } else {
        message.error('Module not found');
      }
    } catch (error) {
      message.error('Failed to fetch module');
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabs = (
    <Tabs value={tabs.value} onChange={tabs.onChange} sx={{ mb: { xs: 2, md: 2 } }}>
      {TX_VIEW_TABS.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </Tabs>
  );

  return (
    <DashboardContent maxWidth="xl">
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
          {tabs.value === 'overview' &&
            objectDetail?.map((item: any) => <ObjectDetail object={item} />)}
          {tabs.value === 'module' && (
            <>
              {!moduleName && (
                <div className="flex gap-4 items-center mb-6">
                  <Input
                    placeholder="Enter Module Name"
                    value={inputModuleName}
                    onChange={(e) => setInputModuleName(e.target.value)}
                    style={{
                      maxWidth: 300,
                      background: isDark ? '#1a1f2e' : '#fff',
                      color: isDark ? '#e5e7eb' : 'inherit',
                      borderColor: isDark ? '#2d3949' : undefined,
                    }}
                    className={isDark ? 'dark-mode-input' : ''}
                    onPressEnter={handleSubmitModuleName}
                    disabled={isLoading}
                  />
                  <Button
                    variant="text"
                    onClick={handleSubmitModuleName}
                    disabled={!inputModuleName || isLoading}
                    sx={{
                      px: 3,
                      py: 1,
                      minWidth: 0,
                      boxShadow: 'none',
                      bgcolor: 'transparent',
                      border: '1px solid',
                      borderColor: isDark ? '#2d3949' : '#e5e7eb',
                      color: !inputModuleName || isLoading
                        ? isDark
                          ? '#9ca3af'
                          : '#6b7280'
                        : isDark
                          ? '#e5e7eb'
                          : '#111827',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    {isLoading ? 'Loading...' : 'Submit'}
                  </Button>
                </div>
              )}
              {moduleName && (
                <div className="flex justify-start items-center mt-4 mb-6">
                  <div style={{
                    fontSize: '1rem',
                    color: isDark ? 'white' : 'primary',
                    fontWeight: 600,
                  }}>
                    Current Module: <span style={{ color: isDark ? '#e5e7eb' : '#111827' }}>{moduleName}</span>
                  </div>
                  <Button
                    variant="text"
                    onClick={() => {
                      setModuleName(undefined);
                      setInputModuleName('');
                    }}
                    sx={{
                      ml: 2,
                      px: 3,
                      py: 1,
                      minWidth: 0,
                      boxShadow: 'none',
                      bgcolor: 'transparent',
                      border: '1px solid',
                      borderColor: isDark ? '#2d3949' : '#e5e7eb',
                      color: isDark ? '#e5e7eb' : '#111827',
                      '&:hover': {
                        bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                        boxShadow: 'none',
                      },
                    }}
                  >
                    Change Module
                  </Button>
                </div>
              )}
              <ModuleView moduleId={params.id} moduleName={moduleName} />
            </>
          )}
          {tabs.value === 'raw' && (
            <Stack>
              <SyntaxHighlighter
                language="json"
                style={mode === 'light' ? duotoneLight : duotoneDark}
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
  );
}

// function PropsKeyItem({ itemKey }: { itemKey: string }) {
//   return <Box className="w-48 text-sm font-semibold text-gray-600">{itemKey}</Box>;
// }

// function PropsValueItem({ children, loading }: { children: ReactNode; loading?: boolean }) {
//   if (loading) {
//     return <Skeleton width="160px" height="16px" />;
//   }
//   return children;
// }
