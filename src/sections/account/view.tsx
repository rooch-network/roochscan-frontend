'use client';

import { useState, useEffect } from 'react';
import { isValidBitcoinAddress } from '@roochnetwork/rooch-sdk';
import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';

import { Box, Card, Chip, Stack, CardHeader, CardContent, Button } from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import useAddressChanged from 'src/routes/hooks/useAddressChanged';

import { BitcoinAddressToRoochAddress } from 'src/utils/address';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import AssetsTableCard from '../assets/components/assets-table-card';
import TransactionsTableCard from '../transactions/components/transactions-table-card';


export function AccountView({ address }: { address: string }) {
  const [viewAddress, setViewAddress] = useState<string>();
  const [viewRoochAddress, setViewRoochAddress] = useState<string>();
  const router = useRouter();
  useAddressChanged({ address, path: 'account' });

  useEffect(() => {
    if (isValidBitcoinAddress(address)) {
      setViewAddress(address);
      try {
        setViewRoochAddress(BitcoinAddressToRoochAddress(address!).toHexAddress());
      } catch (error) {
        toast.error('Invalid query address');
        router.push('/search');
      }
    } else {
      toast.error('Invalid query address');
      router.push('/search');
    }
  }, [address, router]);

  const { data: transactionsList, isPending: isTransactionsPending } = useRoochClientQuery(
    'queryTransactions',
    {
      filter: {
        sender: viewRoochAddress!,
      },
      limit: '5',
    },
    { enabled: !!viewAddress }
  );
  console.log(transactionsList,"transactionsList");
  
  if (!viewAddress) {
    return null;
  }

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
      <Card>
        <CardHeader title="Account Info" sx={{ mb: 1 }} />
        <CardContent className="!pt-0">
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center">
              <Chip
                className="w-fit !cursor-pointer"
                label={viewAddress}
                variant="soft"
                color="secondary"
                component={RouterLink}
                href={`/account/${viewAddress}`}
              />
            </Stack>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Chip
                className="w-fit"
                label={BitcoinAddressToRoochAddress(viewAddress).toStr()}
                variant="soft"
                color="default"
              />
              <Box className="text-sm font-medium text-gray-400">(Rooch Address)</Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      <AssetsTableCard dense address={viewAddress} />
      <TransactionsTableCard
        dense
        address={viewAddress}
        isPending={isTransactionsPending}
        transactionsList={transactionsList}
      />
    </DashboardContent>
  );
}
