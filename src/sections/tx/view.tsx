'use client';

import type { ReactNode } from 'react';

import dayjs from 'dayjs';
import { useMemo, useState, useEffect } from 'react';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNetwork } from '@/context/network-provider';
import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneDark, duotoneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import {
  Tab,
  Box,
  Card,
  Tabs,
  Chip,
  Stack,
  Button,
  Divider,
  Skeleton,
  CardHeader,
  CardContent,
  useColorScheme,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useTabs } from 'src/hooks/use-tabs';
import { useDecodeArgs } from 'src/hooks/use-decode-args';

import { formatCoin } from 'src/utils/format-number';

import { varAlpha } from 'src/theme/styles';
import { DashboardContent } from 'src/layouts/dashboard';
import { ROOCH_GAS_COIN_DECIMALS } from 'src/config/constant';

import { Iconify } from 'src/components/iconify';

import {
  TRANSACTION_TYPE_MAP,
  TRANSACTION_ACTION_TYPE_MAP,
  TRANSACTION_STATUS_TYPE_MAP,
} from '../transactions/constant';

dayjs.extend(relativeTime);

const TX_VIEW_TABS = [
  { label: 'Overview', value: 'overview' },
  { label: 'Action Call', value: 'call' },
  { label: 'Raw JSON', value: 'raw' },
];

function PropsKeyItem({ itemKey }: { itemKey: string }) {
  return <Box className="w-24 flex-shrink-0 text-sm font-semibold text-gray-600">{itemKey}</Box>;
}

function PropsValueItem({ children, loading }: { children: ReactNode; loading?: boolean }) {
  if (loading) {
    return <Skeleton width="160px" height="16px" />;
  }
  return children;
}

export function TxView({ hash }: { hash: string }) {
  const tabs = useTabs('overview');
  const router = useRouter();
  const { mode } = useColorScheme();
  const { network } = useNetwork();

  const { data: transactionDetail, isPending } = useRoochClientQuery('queryTransactions', {
    filter: {
      tx_hashes: [hash],
    },
  });

  const txDetail = useMemo(() => transactionDetail?.data[0], [transactionDetail]);

  const [moduleAddress, setModuleAddress] = useState<string>();
  const [moduleName, setModuleName] = useState<string>();

  useEffect(() => {
    if (
      txDetail?.transaction.data.type === 'l2_tx' &&
      txDetail?.transaction.data.action?.function_call?.function_id
    ) {
      const [address, modName] =
        txDetail.transaction.data.action.function_call.function_id.split('::');
      setModuleAddress(address);
      setModuleName(modName);
    }
  }, [txDetail]);

  const { data: moduleABI } = useRoochClientQuery(
    'getModuleAbi',
    {
      moduleAddr: moduleAddress || '',
      moduleName: moduleName || '',
    },
    {
      enabled: !!moduleAddress && !!moduleName,
    }
  );

  const { decodedArgs, isDecodingArgs } = useDecodeArgs({
    moduleABI,
    functionId:
      (txDetail?.transaction.data.type === 'l2_tx' &&
        txDetail?.transaction.data.action?.function_call?.function_id) ||
      '',
    args:
      (txDetail?.transaction.data.type === 'l2_tx' &&
        txDetail?.transaction.data.action?.function_call?.args) ||
      [],
  });

  const formatDecodedValue = (value: string) => {
    try {
      const parsed = JSON.parse(value);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return value;
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
        <CardHeader title="Transactions" subheader={hash} sx={{ mb: 3 }} />

        <Divider />

        <CardContent className="!pt-0">
          {renderTabs}
          {tabs.value === 'overview' && (
            <Stack
              spacing={2}
              className="p-4"
              sx={{
                borderRadius: 2,
                bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
                border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
              }}
            >
              <Stack direction="row" alignItems="center">
                <PropsKeyItem itemKey="Order" />
                <PropsValueItem loading={isPending}>
                  {txDetail && (
                    <Box>
                      <Chip
                        label={txDetail.transaction.sequence_info.tx_order}
                        size="small"
                        variant="outlined"
                        color="default"
                      />
                    </Box>
                  )}
                </PropsValueItem>
              </Stack>

              <Stack direction="row" alignItems="center">
                <PropsKeyItem itemKey="Type" />
                <PropsValueItem loading={isPending}>
                  {txDetail && (
                    <Box>
                      <Chip
                        label={TRANSACTION_TYPE_MAP[txDetail.transaction.data.type].text}
                        size="small"
                        variant="soft"
                        color={TRANSACTION_TYPE_MAP[txDetail.transaction.data.type].color}
                      />
                      {txDetail.transaction.data.type === 'l1_tx' && (
                        <Button
                          component="a"
                          href={
                            network === 'mainnet'
                              ? `https://mempool.space/tx/${txDetail.transaction.data.bitcoin_txid}`
                              : `https://mempool.space/testnet/tx/${txDetail.transaction.data.bitcoin_txid}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          startIcon={<Iconify icon="eva:external-link-fill" />}
                          size="small"
                          sx={{ ml: 1 }}
                        >
                          View in Mempool
                        </Button>
                      )}
                    </Box>
                  )}
                </PropsValueItem>
              </Stack>

              {txDetail?.execution_info && (
                <Stack direction="row" alignItems="center">
                  <PropsKeyItem itemKey="Status" />
                  <PropsValueItem loading={isPending}>
                    <Box>
                      {txDetail && (
                        <Chip
                          label={
                            TRANSACTION_STATUS_TYPE_MAP[txDetail.execution_info.status.type].text
                          }
                          size="small"
                          variant="soft"
                          color={
                            TRANSACTION_STATUS_TYPE_MAP[txDetail.execution_info.status.type].color
                          }
                        />
                      )}
                    </Box>
                  </PropsValueItem>
                </Stack>
              )}

              <Stack direction="row" alignItems="center">
                <PropsKeyItem itemKey="Timestamp" />
                <PropsValueItem loading={isPending}>
                  {txDetail && (
                    <Box className="text-sm font-semibold">
                      {dayjs(Number(txDetail.transaction.sequence_info.tx_timestamp)).fromNow()}

                      <span className="ml-2 text-gray-500">
                        (
                        {dayjs(Number(txDetail.transaction.sequence_info.tx_timestamp)).format(
                          'MMMM DD, YYYY HH:mm:ss   UTC Z'
                        )}
                        )
                      </span>
                    </Box>
                  )}
                </PropsValueItem>
              </Stack>

              {txDetail && txDetail.transaction.data.type === 'l2_tx' && (
                <Stack direction="row" alignItems="center">
                  <PropsKeyItem itemKey="Action Type" />
                  <PropsValueItem loading={isPending}>
                    <Box>
                      <Chip
                        label={
                          TRANSACTION_ACTION_TYPE_MAP[txDetail.transaction.data.action_type].text
                        }
                        size="small"
                        variant="outlined"
                        color={
                          TRANSACTION_ACTION_TYPE_MAP[txDetail.transaction.data.action_type].color
                        }
                      />
                    </Box>
                  </PropsValueItem>
                </Stack>
              )}

              {txDetail && txDetail.transaction.data.type === 'l2_tx' && (
                <Stack direction="row" alignItems="flex-start">
                  <PropsKeyItem itemKey="Sender" />
                  <PropsValueItem loading={isPending}>
                    <Stack spacing={1}>
                      {txDetail && (
                        <>
                          <Chip
                            className="w-fit !cursor-pointer"
                            label={txDetail.transaction.data.sender_bitcoin_address}
                            size="small"
                            variant="soft"
                            color="secondary"
                            component={RouterLink}
                            href={`/account/${txDetail.transaction.data.sender_bitcoin_address}`}
                          />
                          <Stack direction="row" alignItems="center" spacing={0.5}>
                            <Chip
                              className="w-fit"
                              label={txDetail?.transaction.data.sender}
                              size="small"
                              variant="soft"
                              color="default"
                            />
                            <Box className="text-sm font-medium text-gray-400">(Rooch Address)</Box>
                          </Stack>
                        </>
                      )}
                    </Stack>
                  </PropsValueItem>
                </Stack>
              )}

              {txDetail && txDetail.transaction.data.type === 'l2_tx' && (
                <Stack direction="row" alignItems="center">
                  <PropsKeyItem itemKey="Sequence Number" />
                  <PropsValueItem loading={isPending}>
                    {txDetail && (
                      <Box>
                        <Chip
                          label={txDetail.transaction.data.sequence_number}
                          size="small"
                          variant="outlined"
                          color="default"
                        />
                      </Box>
                    )}
                  </PropsValueItem>
                </Stack>
              )}

              {txDetail?.execution_info && (
                <Stack direction="row" alignItems="center">
                  <PropsKeyItem itemKey="Gas Used" />
                  <PropsValueItem loading={isPending}>
                    {txDetail && (
                      <Box className="text-sm font-semibold">
                        {formatCoin(
                          Number(txDetail.execution_info.gas_used),
                          ROOCH_GAS_COIN_DECIMALS,
                          8
                        )}{' '}
                        RGAS
                      </Box>
                    )}
                  </PropsValueItem>
                </Stack>
              )}

              {/* <Stack direction="row" alignItems="center">
              <PropsKeyItem itemKey="Action Call args" />
              <Box>5959155</Box>
            </Stack> */}
            </Stack>
          )}
          {tabs.value === 'call' && txDetail?.transaction.data.type === 'l2_tx' && (
            <Stack
              spacing={2}
              className="p-4"
              sx={{
                borderRadius: 2,
                bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
                border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
              }}
            >
              {txDetail.transaction.data.action?.function_call ? (
                <>
                  <Stack direction="row" alignItems="flex-start">
                    <PropsKeyItem itemKey="Function" />
                    <PropsValueItem loading={isPending}>
                      <Box>
                        <Chip
                          label={txDetail.transaction.data.action.function_call.function_id}
                          size="small"
                          variant="soft"
                          color="primary"
                          sx={{ fontSize: '0.85rem' }}
                        />
                      </Box>
                    </PropsValueItem>
                  </Stack>

                  <Stack direction="row" alignItems="flex-start">
                    <PropsKeyItem itemKey="Parameters" />
                    <PropsValueItem loading={isDecodingArgs}>
                      <Stack spacing={2}>
                        {decodedArgs.map((arg, index) => (
                          <Card
                            key={index}
                            variant="outlined"
                            className="w-full"
                            sx={{
                              '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: (theme) => varAlpha(theme.vars.palette.primary.main, 0.02),
                              },
                              transition: 'all 0.2s ease-in-out',
                            }}
                          >
                            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                              <Stack spacing={2}>
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                  sx={{
                                    pb: 1,
                                    borderBottom: (theme) =>
                                      `1px dashed ${theme.vars.palette.divider}`,
                                  }}
                                >
                                  <Chip
                                    label={`Parameter #${index + 1}`}
                                    size="small"
                                    color="default"
                                    sx={{ fontWeight: 600 }}
                                  />
                                  <Chip
                                    label={arg.type}
                                    size="small"
                                    variant="soft"
                                    color="primary"
                                  />
                                </Stack>

                                {arg.decoded && (
                                  <Box>
                                    <Box className="text-xs font-medium text-gray-500 mb-1 uppercase">
                                      Value
                                    </Box>
                                    <Box className="text-sm break-all p-2 rounded"
                                      sx={{
                                        bgcolor: (theme) =>
                                          varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
                                        fontSize: '0.85rem',
                                      }}>
                                      {formatDecodedValue(arg.decoded)}
                                    </Box>
                                  </Box>
                                )}
                                {arg.raw && (
                                  <Box>
                                    <Box className="text-xs font-medium text-gray-500 mb-1 uppercase">
                                      Raw Data
                                    </Box>
                                    <Box
                                      className="text-sm break-all p-2 rounded"
                                      sx={{
                                        bgcolor: (theme) =>
                                          varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
                                        fontSize: '0.85rem',
                                      }}
                                    >
                                      {arg.raw}
                                    </Box>
                                  </Box>
                                )}
                              </Stack>
                            </CardContent>
                          </Card>
                        ))}
                      </Stack>
                    </PropsValueItem>
                  </Stack>
                </>
              ) : (
                <Box className="text-sm text-center py-8" sx={{ color: 'text.secondary' }}>
                  <Stack spacing={1} alignItems="center">
                    <Iconify icon="mdi:function-variant" width={40} sx={{ opacity: 0.4 }} />
                    <Box>No function call data available for this transaction</Box>
                  </Stack>
                </Box>
              )}
            </Stack>
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
                {JSON.stringify(txDetail, null, 2)}
              </SyntaxHighlighter>
            </Stack>
          )}
        </CardContent>
      </Card>
    </DashboardContent>
  );
}
