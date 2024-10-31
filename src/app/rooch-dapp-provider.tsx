'use client';

import { useMemo, type ReactNode } from 'react';
import { getRoochNodeUrl, NetWorkType } from '@roochnetwork/rooch-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoochProvider, WalletProvider } from '@roochnetwork/rooch-sdk-kit';

import { networkConfig } from 'src/hooks/use-networks';

import useStore from 'src/store';

import { isMainNetwork } from '../utils/env';

const queryClient = new QueryClient({});

export default function RoochDappProvider({ children }: { children: ReactNode }) {
  const { roochNodeUrl } = useStore();
  let network = isMainNetwork() ? 'mainnet' : 'testnet';
  if (roochNodeUrl === getRoochNodeUrl('mainnet')) {
    network = 'mainnet';
  } else if (roochNodeUrl === getRoochNodeUrl('testnet')) {
    network = 'testnet';
  } else {
    network = 'localnet';
  }
  console.log(network, 'network');

  return (
    <QueryClientProvider client={queryClient}>
      <RoochProvider networks={networkConfig}  defaultNetwork="testnet">
        <WalletProvider chain="bitcoin" autoConnect>
          {children}
        </WalletProvider>
      </RoochProvider>
    </QueryClientProvider>
  );
}
