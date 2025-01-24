'use client';

import React from 'react';
import { useRouter } from '@/routes/hooks';
import { useTabs } from '@/hooks/use-tabs';
import { Iconify } from '@/components/iconify';
import { DashboardContent } from '@/layouts/dashboard';
import { ModuleView } from '@/components/module/module-view';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneDark, duotoneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';

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

const TX_VIEW_TABS = [
  { label: 'Overview', value: 'overview' },
  { label: 'Raw JSON', value: 'raw' },
];

const ModulePage = ({ params }: { params: { id: string } }) => {
  const id = decodeURIComponent(params.id);
  const tabs = useTabs('overview');
  const [moduleId, moduleName] = id.split('::');
  const router = useRouter();
  const { mode } = useColorScheme();
  
  const { data: module } = useRoochClientQuery('getModuleAbi', {
    moduleAddr: moduleId,
    moduleName,
  });

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
        <CardHeader title="Module" subheader={id} sx={{ mb: 3 }} />
        <Divider />
        <CardContent className="!pt-0">
          {renderTabs}

          {tabs.value === 'overview' && (
            <ModuleView moduleId={moduleId} moduleName={moduleName} />
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
                {JSON.stringify(module, null, 2)}
              </SyntaxHighlighter>
            </Stack>
          )}
        </CardContent>
      </Card>
    </DashboardContent>
  );
};

export default ModulePage;
