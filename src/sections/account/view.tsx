'use client';

import { useState, useEffect } from 'react';
import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';
import { RoochAddress, isValidRoochAddress, isValidBitcoinAddress } from '@roochnetwork/rooch-sdk';

import { Box, Card, Chip, Stack, Button, CardHeader, CardContent, Tab, Tabs } from '@mui/material';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';
import useAddressChanged from 'src/routes/hooks/useAddressChanged';

import { useTabs } from 'src/hooks/use-tabs';

import { BitcoinAddressToRoochAddress } from 'src/utils/address';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import ObjectsTableCard from './components/objects-table-card';
import AssetsTableCard from '../assets/components/assets-table-card';
import TransactionsTableCard from '../transactions/components/transactions-table-card';

const ACCOUNT_VIEW_TABS = [
  { label: 'Coins', value: 'coins' },
  { label: 'Objects', value: 'objects' },
  { label: 'Transactions', value: 'transactions' },
];

export function AccountView({ address }: { address: string }) {
  const [viewBitcoinAddress, setViewBitcoinAddress] = useState<string>();
  const [viewRoochAddress, setViewRoochAddress] = useState<string>();
  const [viewRoochBech32Address, setViewRoochBech32Address] = useState<string>();
  const tabs = useTabs('coins');

  const router = useRouter();
  useAddressChanged({ address, path: 'account' });

  useEffect(() => {
    if (isValidRoochAddress(address)) {
      const roochAddress = new RoochAddress(address);
      const roochHexAddress = roochAddress.toHexAddress();
      setViewRoochAddress(roochHexAddress);
      setViewRoochBech32Address(roochAddress.toBech32Address());
    } else if (isValidBitcoinAddress(address)) {
      setViewBitcoinAddress(address);
      try {
        const roochAddress = BitcoinAddressToRoochAddress(address!);
        setViewRoochAddress(roochAddress.toHexAddress());
        setViewRoochBech32Address(roochAddress.toBech32Address());
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
    { enabled: !!viewBitcoinAddress || !!viewRoochAddress }
  );
  // console.log(transactionsList, 'transactionsList');

  const renderTabs = (
    <Tabs 
      value={tabs.value} 
      onChange={tabs.onChange} 
      sx={{ 
        mb: { xs: 2, md: 2 },
        '& .MuiTab-root': {
          fontSize: '1.125rem',
          fontWeight: 600,
          textTransform: 'none',
          minHeight: 48,
          py: 2
        }
      }}
    >
      {ACCOUNT_VIEW_TABS.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </Tabs>
  );

  if (!viewBitcoinAddress && !viewRoochAddress) {
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
            {viewBitcoinAddress && (
              <Stack direction="row" alignItems="center">
                <Chip
                  className="w-fit !cursor-pointer"
                  label={viewBitcoinAddress}
                  variant="soft"
                  color="secondary"
                  component={RouterLink}
                  href={`/account/${viewBitcoinAddress}`}
                />
              </Stack>
            )}
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <Chip
                className="w-fit"
                label={viewRoochBech32Address}
                variant="soft"
                color="default"
              />
              <Box className="text-sm font-medium text-gray-400">(Rooch Address)</Box>
            </Stack>
          </Stack>
        </CardContent>
      </Card>

      {renderTabs}

      {tabs.value === 'coins' && (
        <AssetsTableCard
          dense
          hideHeader
          bitcoinAddress={viewBitcoinAddress}
          roochAddress={viewRoochBech32Address}
        />
      )}
      
      {tabs.value === 'objects' && (
        <ObjectsTableCard
          dense
          hideHeader
          address={viewRoochAddress!}
        />
      )}
      
      {tabs.value === 'transactions' && (
        <TransactionsTableCard
          dense
          hideHeader
          address={address}
          isPending={isTransactionsPending}
          transactionsList={transactionsList}
        />
      )}
    </DashboardContent>
  );
}
