'use client';

import { ConnectButton } from '@roochnetwork/rooch-sdk-kit';

import { useMediaQuery } from '@mui/material';


export const ConnectButtonWrapper = () => {
  const isMobile = useMediaQuery('(max-width:600px)');  // 根据需要调整断点

  if (isMobile) return null;
  
  return <ConnectButton />;
}; 