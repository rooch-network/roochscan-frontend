'use client';

import { useRef, useMemo, useState, useEffect } from 'react';
import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';

import { Button } from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import useAddressChanged from 'src/routes/hooks/useAddressChanged';

import { BitcoinAddressToRoochAddress } from 'src/utils/address';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import TransactionsTableCard from './components/transactions-table-card';


export function TransactionsView({ address }: { address: string }) {
  const [paginationModel, setPaginationModel] = useState({ index: 1, limit: 10 });
  const mapPageToNextCursor = useRef<{ [page: number]: string | null }>({});
  const router = useRouter();

  useAddressChanged({ address, path: 'transactions' });

  const queryOptions = useMemo(
    () => ({
      cursor: mapPageToNextCursor.current[paginationModel.index - 1]?.toString(),
      limit: paginationModel.limit.toString(),
    }),
    [paginationModel]
  );

  const { data: transactionsList, isPending } = useRoochClientQuery('queryTransactions', {
    filter: {
      sender: BitcoinAddressToRoochAddress(address).toHexAddress(),
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
    console.log(index);
    if (index < 0) {
      return;
    }
    setPaginationModel({
      ...paginationModel,
      index,
    });
  };

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
      <TransactionsTableCard
        address={address}
        isPending={isPending}
        transactionsList={transactionsList}
        paginationModel={paginationModel}
        paginate={paginate}
      />
    </DashboardContent>
  );
}
