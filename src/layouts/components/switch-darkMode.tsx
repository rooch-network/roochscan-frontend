'use client';

import type { SelectChangeEvent } from '@mui/material/Select';

import * as React from 'react';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useColorScheme } from '@mui/material';
import {WbSunnyOutlined,DarkModeOutlined} from '@mui/icons-material';

export function SwitchDorkMode() {
  const { mode, setMode } = useColorScheme();
  const handleChange = (event: SelectChangeEvent) => {
    setMode(event.target.value as any);
  };

  return (
    <div>
      <Select
        value={mode}
        size="small"
        onChange={handleChange}
        displayEmpty
      >
        <MenuItem value="light">
          <WbSunnyOutlined  fontSize='small'  />
        </MenuItem>
        <MenuItem value="dark">
          <DarkModeOutlined  fontSize='small'  />
        </MenuItem>
      </Select>
    </div>
  );
}
