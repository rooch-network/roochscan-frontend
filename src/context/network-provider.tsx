import type { ReactNode } from 'react';
import type { NetWorkType } from '@roochnetwork/rooch-sdk';

import { getRoochNodeUrl } from '@roochnetwork/rooch-sdk';
import { useMemo, useContext, useCallback, createContext } from 'react';

import useStore from 'src/store';

type NetworkContextType = {
  network: NetWorkType;
  roochNodeUrl: string;
  setNetwork: (network: NetWorkType) => void;
};

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

type NetworkProviderProps = {
  children: ReactNode;
};

export function NetworkProvider({ children }: NetworkProviderProps) {
  const { roochNodeUrl, setRoochNodeUrl } = useStore();

  const network = useMemo<NetWorkType>(() => {
    if (roochNodeUrl === getRoochNodeUrl('mainnet')) {
      return 'mainnet';
    }
    if (roochNodeUrl === getRoochNodeUrl('testnet')) {
      return 'testnet';
    }
    return 'localnet';
  }, [roochNodeUrl]);

  const setNetwork = useCallback(
    (newNetwork: NetWorkType) => {
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

export function useNetwork() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
}
