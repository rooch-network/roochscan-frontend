'use client';

import { ConnectButton } from '@roochnetwork/rooch-sdk-kit';

import { useMediaQuery } from '@mui/material';


export const ConnectButtonWrapper = () => {
  const isMobile = useMediaQuery('(max-width:600px)');

  if (isMobile) return null;
  
  return <ConnectButton />;
}; 