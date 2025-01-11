'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';

import { Button } from '@mui/material';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import useTimeRange from 'src/hooks/useTimeRange';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import TransactionsTableHome from 'src/sections/transactions/components/transactions-table-home';

export default function TransactionsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialOrder = searchParams.get('order');
  const initialLimit = parseInt(searchParams.get('limit') || '10', 10);
  const mapPageToNextCursor = useRef<{ [page: number]: string | null }>({});
  
  const [paginationModel, setPaginationModel] = useState({ 
    index: 1,
    limit: initialLimit
  });

  const queryOptions = useMemo(
    () => ({
      cursor: mapPageToNextCursor.current[paginationModel.index - 1] || null,
      limit: paginationModel.limit.toString(),
    }),
    [paginationModel]
  );
  const { fiveMinutesAgoMillis, currentTimeMillis } = useTimeRange(5000, false);

  const { data: transactionsList, isPending } = useRoochClientQuery('queryTransactions', {
    filter: queryOptions.cursor
      ? {
          tx_order_range: {
            from_order: Math.max(0, Number(BigInt(queryOptions.cursor) - BigInt(queryOptions.limit + 10))).toString(),
            to_order: queryOptions.cursor,
          },
        }
      : initialOrder
      ? {
          tx_order_range: {
            from_order: Math.max(0, Number(BigInt(initialOrder) - BigInt(queryOptions.limit + 10))).toString(),
            to_order: initialOrder,
          },
        }
      : {
          time_range: {
            start_time: fiveMinutesAgoMillis.toString(),
            end_time: currentTimeMillis.toString(),
          },
        },
    cursor: queryOptions.cursor,
    limit: queryOptions.limit,
  });

  useEffect(() => {
    if (!transactionsList?.has_next_page || !transactionsList?.next_cursor) {
      return;
    }

    // Store the cursor for next page
    const nextPageIndex = paginationModel.index + 1;
    mapPageToNextCursor.current[nextPageIndex] = transactionsList.next_cursor;

    // If we're on the first page
    if (paginationModel.index === 1) {
      if (initialOrder) {
        // If we have initial order, use it for first page
        mapPageToNextCursor.current[1] = initialOrder;
      } else {
        // If using timerange, store first page cursor
        mapPageToNextCursor.current[1] = transactionsList.next_cursor;
      }
    }
  }, [paginationModel.index, transactionsList, initialOrder]);

  const paginate = (index: number): void => {
    if (index < 0) {
      return;
    }
    setPaginationModel({
      ...paginationModel,
      index,
    });

    // Update URL with order and limit
    const params = new URLSearchParams();
    const order = mapPageToNextCursor.current[index - 1];
    if (order) {
      params.set('order', order);
    }
    params.set('limit', paginationModel.limit.toString());
    router.push(`/txs?${params.toString()}`);
  };

  return (
    <DashboardContent maxWidth="xl">
      <Button
        className="w-fit"
        onClick={() => {
          router.push('/');
        }}
        startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
      >
        Back
      </Button>
      <TransactionsTableHome
        isPending={isPending}
        transactionsList={transactionsList}
        paginationModel={paginationModel}
        paginate={paginate}
      />
    </DashboardContent>
  );
}
