'use client';

import type { ReactNode } from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RoochProvider, WalletProvider, SupportChain } from '@roochnetwork/rooch-sdk-kit';
import {networkConfig} from "@/hooks/use-networks";

const queryClient = new QueryClient();

export default function RoochDappProvider({ children }: { children: ReactNode }) {
  const network = 'testnet'
  return (
    <QueryClientProvider client={queryClient}>
      <RoochProvider  networks={networkConfig} defaultNetwork={network}>
        <WalletProvider chain={"bitcoin"} autoConnect>
          {children}
        </WalletProvider>
      </RoochProvider>
    </QueryClientProvider>
  );
}