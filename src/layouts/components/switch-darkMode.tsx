'use client';

import type { SelectChangeEvent } from '@mui/material/Select';

import * as React from 'react';

import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Button, useColorScheme } from '@mui/material';
import {WbSunnyOutlined,DarkModeOutlined} from '@mui/icons-material';

export function SwitchDorkMode() {
  const { mode, setMode } = useColorScheme();
  const handleChange = () => {
    if(mode ==='dark') {
        setMode('light')
    }else {
      setMode('dark')
    }
  };

  return (
    <Button
    className="w-fit"
    onClick={handleChange}
  >
      {mode === 'dark' ? <DarkModeOutlined  fontSize='small'  /> : <WbSunnyOutlined  fontSize='small'  />}
  </Button>
  )
}
