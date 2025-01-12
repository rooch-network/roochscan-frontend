import type { PaginatedTransactionWithInfoViews } from '@roochnetwork/rooch-sdk';

import dayjs from 'dayjs';
import useStore from '@/store';
import { useMemo } from 'react';
import { useNetwork } from '@/context/network-provider';

import {
  Box,
  Card,
  Chip,
  Table,
  Stack,
  Button,
  Tooltip,
  TableRow,
  TableBody,
  TableCell,
  CardHeader,
  Typography,
  Pagination,
  Skeleton,
  LinearProgress,
} from '@mui/material';

import { RouterLink } from 'src/routes/components';

import { formatCoin } from 'src/utils/format-number';
import { getUTCOffset } from 'src/utils/format-time';
import { shotSentTo, shortAddress } from 'src/utils/address';

import { NetWorkPath, ROOCH_GAS_COIN_DECIMALS } from 'src/config/constant';

import { Scrollbar } from 'src/components/scrollbar';
import { TableNoData, TableHeadCustom } from 'src/components/table';

import { TRANSACTION_TYPE_MAP, TRANSACTION_STATUS_TYPE_MAP } from '../constant';

export default function TransactionsTableCard({
  transactionsList,
  paginationModel,
  paginate,
  dense,
  filterButton,
  isPending,
}: {
  transactionsList?: PaginatedTransactionWithInfoViews;
  paginationModel?: {
    index: number;
    limit: number;
  };
  paginate?: (index: number) => void;
  dense?: boolean;
  filterButton?: React.ReactNode;
  isPending?: boolean;
}) {
  const { network} = useNetwork();

  const renderSkeleton = () => (
    <>
      {[...Array(5)].map((_, index) => (
        <TableRow key={index}>
          <TableCell><Skeleton animation="wave" width={60} /></TableCell>
          <TableCell width="256px"><Skeleton animation="wave" width={200} /></TableCell>
          <TableCell><Skeleton animation="wave" width={180} /></TableCell>
          <TableCell><Skeleton animation="wave" width={120} /></TableCell>
          <TableCell><Skeleton animation="wave" width={80} /></TableCell>
          <TableCell><Skeleton animation="wave" width={80} /></TableCell>
          <TableCell><Skeleton animation="wave" width={60} /></TableCell>
          <TableCell align="center"><Skeleton animation="wave" width={60} /></TableCell>
        </TableRow>
      ))}
    </>
  );
  
  return (
    <Card className="mt-4">
      <CardHeader 
        title={
          <Stack direction="row" alignItems="center" spacing={2}>
            <Typography variant="h6">Last Transactions</Typography>
            {filterButton}
          </Stack>
        } 
        sx={{ mb: 3 }} 
      />
      {isPending && <LinearProgress />}
      <Scrollbar sx={{ minHeight: dense ? undefined : 462 }}>
        <Table sx={{ minWidth: 720 }} size={dense ? 'small' : 'medium'}>
          <TableHeadCustom
            headLabel={[
              {
                id: 'order',
                label: 'Order',
              },
              { id: 'coin', label: 'Transaction Hash' },
              {
                id: 'timestamp',
                label: (
                  <Box>
                    Timestamp <span className="ml-1 text-xs">({getUTCOffset()})</span>
                  </Box>
                ),
              },
              {
                id: 'functio',
                label: 'Function',
              },
              { id: 'status', label: 'Status' },
              { id: 'type', label: 'Type' },
              { id: 'gas', label: 'Gas' },
              { id: 'action', label: 'Action', align: 'center' },
            ]}
          />
          <TableBody>
            {isPending ? (
              renderSkeleton()
            ) : (
              <>
                {transactionsList?.data.map((item) => (
                  <TableRow key={item.execution_info?.tx_hash}>
                    <TableCell>{item.transaction.sequence_info.tx_order}</TableCell>
                    <TableCell width="256px">
                      <Typography className="!font-mono !font-medium">
                        <Tooltip title={item.execution_info?.tx_hash} arrow>
                          <span>{shortAddress(item.execution_info?.tx_hash, 8, 6)}</span>
                        </Tooltip>
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {dayjs(Number(item.transaction.sequence_info.tx_timestamp)).format(
                        'MMMM DD, YYYY HH:mm:ss'
                      )}
                    </TableCell>

                    <TableCell>
                      {shotSentTo((item.transaction.data as any).action?.function_call?.function_id)}
                    </TableCell>
                    {item.execution_info && (
                      <TableCell>
                        <Chip
                          label={TRANSACTION_STATUS_TYPE_MAP[item.execution_info.status.type].text}
                          size="small"
                          variant="soft"
                          color={TRANSACTION_STATUS_TYPE_MAP[item.execution_info.status.type].color}
                        />
                      </TableCell>
                    )}
                    <TableCell>
                      <Chip
                        label={TRANSACTION_TYPE_MAP[item.transaction.data.type].text}
                        size="small"
                        variant="soft"
                        color={TRANSACTION_TYPE_MAP[item.transaction.data.type].color}
                      />
                    </TableCell>
                    {item.execution_info && (
                      <TableCell className="!text-xs">
                        {formatCoin(Number(item.execution_info.gas_used), ROOCH_GAS_COIN_DECIMALS, 6)}
                      </TableCell>
                    )}
                    {item.execution_info && (
                      <TableCell align="center">
                        <Button component={RouterLink} href={`/${NetWorkPath[network]}/tx/${item.execution_info.tx_hash}`}>
                          View
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
                <TableNoData
                  title="No Transaction Found"
                  notFound={!isPending && (!transactionsList?.data.length || transactionsList.data.length === 0)}
                />
              </>
            )}
          </TableBody>
        </Table>
      </Scrollbar>
      {!dense && paginationModel && paginate && (
        <Stack className="w-full mt-4 mb-4" alignItems="flex-end">
          <Pagination
            count={
              transactionsList?.has_next_page ? paginationModel.index + 1 : paginationModel.index
            }
            page={paginationModel.index}
            onChange={(event: React.ChangeEvent<unknown>, value: number) => {
              paginate(value);
            }}
          />
        </Stack>
      )}
      {dense && (transactionsList?.data.length || 0) > 0 && (
        <Stack alignItems="center" className="my-2">
          <Button variant="text" color="primary" component={RouterLink} href="/txs">
            View All
          </Button>
        </Stack>
      )}
    </Card>
  );
}
