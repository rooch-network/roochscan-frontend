import type { ReactNode } from 'react';
import type { NetworkType } from '@roochnetwork/rooch-sdk';

import { getRoochNodeUrl } from '@roochnetwork/rooch-sdk';
import { useMemo, useContext, useCallback, createContext, useEffect } from 'react';

import useStore from 'src/store';

type NetworkContextType = {
  network: NetworkType;
  roochNodeUrl: string;
  setNetwork: (network: NetworkType) => void;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

type NetworkProviderProps = {
  children: ReactNode;
};

export function NetworkProvider({ children }: NetworkProviderProps) {
  const { roochNodeUrl, setRoochNodeUrl } = useStore();

  const network = useMemo<NetworkType>(() => {
    if (roochNodeUrl === getRoochNodeUrl('mainnet')) {
      return 'mainnet';
    }
    if (roochNodeUrl === getRoochNodeUrl('testnet')) {
      return 'testnet';
    }
    return 'localnet';
  }, [roochNodeUrl]);

  useEffect(() => {
    const {hostname} = window.location;
    if (hostname === 'roochscan.io') {
      setRoochNodeUrl(getRoochNodeUrl('mainnet'));
    } else if (hostname === 'test.roochscan.io') {
      setRoochNodeUrl(getRoochNodeUrl('testnet'));
    } else if (hostname === 'dev.roochscan.io') {
      setRoochNodeUrl(getRoochNodeUrl('devnet'));
    } else if (hostname === 'local.roochscan.io') {
      setRoochNodeUrl(getRoochNodeUrl('localnet'));
    } else {
      setRoochNodeUrl(getRoochNodeUrl('mainnet'));
    }
  }, [setRoochNodeUrl]);

  const setNetwork = useCallback(
    (newNetwork: NetworkType) => {
      setRoochNodeUrl(getRoochNodeUrl(newNetwork));
    },
    [setRoochNodeUrl]
  );

  const value = useMemo(
    () => ({
      network,
      roochNodeUrl,
      setNetwork,
    }),
    [network, roochNodeUrl, setNetwork]
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
