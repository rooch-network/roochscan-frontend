'use client';

import { useEffect, useMemo, type ReactNode } from 'react';
import { getRoochNodeUrl, NetWorkType } from '@roochnetwork/rooch-sdk';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoochProvider, WalletProvider } from '@roochnetwork/rooch-sdk-kit';

import { networkConfig } from 'src/hooks/use-networks';

import useStore from 'src/store';

const queryClient = new QueryClient();

export default function RoochDappProvider({ children }: { children: ReactNode }) {
  const { roochNodeUrl } = useStore();
  const network = useMemo(() =>{
    let network ;
    if (roochNodeUrl === getRoochNodeUrl('mainnet')) {
      network = 'mainnet';
    } else if (roochNodeUrl === getRoochNodeUrl('testnet')) {
      network = 'testnet';
    } else {
      network = 'localnet';
    }
    return network
  },[roochNodeUrl])

  if(!roochNodeUrl) return <>{children}</>
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
