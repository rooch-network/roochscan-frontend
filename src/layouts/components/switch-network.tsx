'use client';

import type { NetWorkType } from '@roochnetwork/rooch-sdk';
import type { SelectChangeEvent } from '@mui/material/Select';

import * as React from 'react';
import { useParams, useRouter, usePathname } from 'next/navigation';
import { NetWorkPath, NetWorkPathReverse } from '@/config/constant';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import { useNetwork } from 'src/context/network-provider';

const NETWORKS: { label: string; value: NetWorkType }[] = [
  { label: 'Mainnet Network', value: 'mainnet' },
  { label: 'Testnet Network', value: 'testnet' },
  { label: 'Localnet Network', value: 'localnet' },
];

export function SwitchNetWork() {
  const { network, setNetwork } = useNetwork();
  const param = useParams();
  const router = useRouter();
  const pathname = usePathname();
  // console.log('param', param, pathname)

  const handleChange = (event: SelectChangeEvent) => {
    const networkValue = event.target.value as NetWorkType;
    const networkPattern = new RegExp(
      `^/(${Object.keys(NetWorkPathReverse).join('|')})/(tx|account|transactions|object)/[^/]+$`
    );
    if (networkPattern.test(pathname)) {
      if (param.network && param.network !== networkValue) {
        const pathType = pathname.split('/')[2];
        const identifier =
          pathType === 'tx' ? param.hash : pathType === 'object' ? param.id : param.address;
        router.push(`/${NetWorkPath[networkValue]}/${pathType}/${identifier}`);
        return;
      }
    }
    setNetwork(networkValue);
  };

  React.useEffect(() => {
    if (param.network && param.network !== network && (param.hash || param.address)) {
      setNetwork(NetWorkPathReverse[param.network as string]);
    }
  }, [param.network, network, setNetwork, param.hash, param.address]);

  return (
    <div>
      <Select
        value={network}
        size="small"
        onChange={handleChange}
        displayEmpty
        inputProps={{ 'aria-label': 'Without label' }}
      >
        {NETWORKS.map((network) => (
          <MenuItem key={network.value} value={network.value}>
            {network.label}
          </MenuItem>
        ))}
      </Select>
    </div>
  );
}
