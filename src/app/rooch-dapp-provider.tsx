'use client';

import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoochProvider, WalletProvider } from '@roochnetwork/rooch-sdk-kit';

import { networkConfig } from 'src/hooks/use-networks';

import { useNetwork, NetworkProvider } from 'src/context/network-provider';

const queryClient = new QueryClient();

function RoochDappProviderInner({ children }: { children: ReactNode }) {
  const { network } = useNetwork();

  return (
    <QueryClientProvider client={queryClient}>
      <RoochProvider key={network} networks={networkConfig} defaultNetwork={network}>
        <WalletProvider chain="bitcoin" autoConnect>
          {children}
        </WalletProvider>
      </RoochProvider>
    </QueryClientProvider>
  );
}

export default function RoochDappProvider({ children }: { children: ReactNode }) {
  return (
    <NetworkProvider>
      <RoochDappProviderInner>{children}</RoochDappProviderInner>
    </NetworkProvider>
  );
}
