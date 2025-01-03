'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';

import { Button } from '@mui/material';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import useTimeRange from 'src/hooks/useTimeRange';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import TransactionsTableHome from "src/sections/transactions/components/transactions-table-home";

export default function TransactionsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const [paginationModel, setPaginationModel] = useState({ index: initialPage, limit: 10 });
  const mapPageToNextCursor = useRef<{ [page: number]: string | null }>({});

  // Sync pagination state with URL parameters
  useEffect(() => {
    const page = parseInt(searchParams.get('page') || '1', 10);
    if (page !== paginationModel.index) {
      setPaginationModel(prev => ({ ...prev, index: page }));
    }
  }, [searchParams, paginationModel.index]);

  const queryOptions = useMemo(
    () => ({
      cursor: mapPageToNextCursor.current[paginationModel.index - 1]?.toString(),
      limit: paginationModel.limit.toString(),
    }),
    [paginationModel]
  );
  const { fiveMinutesAgoMillis, currentTimeMillis } = useTimeRange(5000,false); 

  const { data: transactionsList, isPending } = useRoochClientQuery('queryTransactions', {
    filter: {
        time_range: {
            start_time: fiveMinutesAgoMillis.toString(),
            end_time: currentTimeMillis.toString(),
          },
    },
    cursor: queryOptions.cursor,
    limit: queryOptions.limit,
  });

  useEffect(() => {
    if (!transactionsList) {
      return;
    }
    if (transactionsList.has_next_page) {
      mapPageToNextCursor.current[paginationModel.index] = transactionsList.next_cursor ?? null;
    }
  }, [paginationModel, transactionsList]);

  const paginate = (index: number): void => {
    if (index < 0) {
      return;
    }
    setPaginationModel({
      ...paginationModel,
      index,
    });
    
    // Update URL with new page number
    const params = new URLSearchParams(window.location.search);
    params.set('page', index.toString());
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
