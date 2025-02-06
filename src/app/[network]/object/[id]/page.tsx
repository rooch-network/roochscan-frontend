'use client';

import { useTabs } from '@/hooks/use-tabs';
import { useRouter } from 'next/navigation';
import { Iconify } from '@/components/iconify';
import React, { useMemo, useState } from 'react';
import { DashboardContent } from '@/layouts/dashboard';
import { ModuleView } from '@/components/module/module-view';
import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneDark, duotoneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import {
  Tab,
  Card,
  Tabs,
  Stack,
  Button,
  Divider,
  MenuItem,
  CardHeader,
  CardContent,
  FormControl,
  useColorScheme,
  Select as MuiSelect,
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
  const [selectedModule, setSelectedModule] = useState<string>();
  const isDark = mode === 'dark';

  const { data, isPending } = useRoochClientQuery('queryObjectStates', {
    filter: {
      object_id: params.id,
    },
  });

  const { data: moduleList, isPending: isModuleListPending } = useRoochClientQuery(
    'getAllModules',
    {
      package_address: params.id,
    },
  );

  const moduleNames = useMemo(() => {
    if (!moduleList) return [];
    return Array.from(moduleList.keys());
  }, [moduleList]);

  // const { data: moduleData, refetch: fetchModule } = useRoochClientQuery(
  //   'getModuleAbi',
  //   {
  //     moduleAddr: params.id,
  //     moduleName: selectedModule,
  //   },
  //   {
  //     enabled: !!selectedModule
  //   }
  // );

  const objectDetail = useMemo(() => data?.data, [data]);

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
            objectDetail?.map((item: any, index: number) => (
              <ObjectDetail key={item.id || index} object={item} />
            ))}
          {tabs.value === 'module' && (
            <>
              {moduleNames.length > 0 && (
                <div className="flex flex-col gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <FormControl
                      sx={{
                        minWidth: 300,
                      }}
                    >
                      <MuiSelect
                        value={selectedModule || ''}
                        onChange={(event) => setSelectedModule(event.target.value)}
                        displayEmpty
                        sx={{
                          height: 40,
                          background: isDark ? '#1a1f2e' : '#fff',
                          '& .MuiSelect-select': {
                            paddingY: '8px',
                          },
                        }}
                      >
                        <MenuItem value="" disabled>
                          Select a module
                        </MenuItem>
                        {moduleNames.map((name) => (
                          <MenuItem key={name} value={name}>
                            {name}
                          </MenuItem>
                        ))}
                      </MuiSelect>
                    </FormControl>
                    {selectedModule && (
                      <Button
                        variant="text"
                        onClick={() => setSelectedModule(undefined)}
                        sx={{
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
                        Clear Selection
                      </Button>
                    )}
                  </div>
                  {isModuleListPending && (
                    <div className="text-gray-500">Loading modules...</div>
                  )}
                </div>
              )}
              <ModuleView moduleId={params.id} moduleName={selectedModule} />
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

