'use client';

import { useState } from 'react';
import { isValidBitcoinAddress } from '@roochnetwork/rooch-sdk';

import { Card, Stack, Button, TextField, CardHeader, CardContent } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { DashboardContent } from 'src/layouts/dashboard';

// const placeholder = 'tb1pjugffa0n2ts0vra032t3phae7xrehdjfzkg284ymvf260vjh225s5u4z76';
const placeholder = 'Search for transactions, accounts, and modules';


export default function SearchView() {
  const [account, setAccount] = useState('');
  const [errorMsg, setErrorMsg] = useState<string>();
  const router = useRouter();
  const handleSearch = () => {
    if (!account.startsWith('0x') && isValidBitcoinAddress(account)) {
      router.push(`/account/${account || placeholder}`);
    } else if (account.startsWith('0x')) {
      router.push(`/tx/${account}`);
    }
  };
  return (
    <DashboardContent maxWidth="xl">
      <Card>
        <CardHeader
          title="Search "
          subheader="Search for transactions, accounts, and modules."
          sx={{ mb: 2 }}
        />
        <CardContent className="!pt-0">
          <Stack direction="row" alignItems="flex-start" className="w-full" spacing={2}>
            <TextField
              size="small"
              className="w-full"
              value={account}
              placeholder={placeholder}
              error={Boolean(errorMsg)}
              helperText={errorMsg}
              onChange={(e) => {
                setAccount(e.target.value);
              }}
            />
            <Button
              onClick={handleSearch}
              // onClick={() => {
              //   if (account && !isValidBitcoinAddress(account)) {
              //     setErrorMsg('Invalid address');
              //     return;
              //   }
              //   router.push(`/account/${account || placeholder}`);
              // }}
            >
              Search
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </DashboardContent>
  );
}
