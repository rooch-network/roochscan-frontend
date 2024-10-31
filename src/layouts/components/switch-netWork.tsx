'use client';

import type { SelectChangeEvent } from '@mui/material/Select';

import * as React from 'react';
import { getRoochNodeUrl } from '@roochnetwork/rooch-sdk';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

import useStore from 'src/store';

const NetWork: any = {
  Mainnet: getRoochNodeUrl('mainnet'),
  Testnet: getRoochNodeUrl('testnet'),
  Localnet: getRoochNodeUrl('localnet'),
};

export function SwitchNetWork() {
  const { roochNodeUrl, setRoochNodeUrl } = useStore();

  const handleChange = (event: SelectChangeEvent) => {
    setRoochNodeUrl(event.target.value);
  };

  return (
    <div>
      <Select
        value={roochNodeUrl}
        size="small"
        onChange={handleChange}
        displayEmpty
        inputProps={{ 'aria-label': 'Without label' }}
      >
        <MenuItem value={NetWork.Mainnet}>Mainnet NetWork</MenuItem>
        <MenuItem value={NetWork.Testnet}>Testnet NetWork</MenuItem>
        <MenuItem value={NetWork.Localnet}>Localnet NetWork</MenuItem>
      </Select>
    </div>
  );
}
