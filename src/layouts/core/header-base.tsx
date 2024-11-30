import type { NavSectionProps } from 'src/components/nav-section';

import { useMemo } from 'react';

import Box from '@mui/material/Box';
import { styled } from '@mui/material/styles';
import { Button, useColorScheme } from '@mui/material';

import { Logo } from 'src/components/logo';

import { HeaderSection } from './header-section';
import { SwitchNetWork } from '../components/switch-netWork';
import { AccountDrawer } from '../components/account-drawer';
import { SwitchDorkMode } from "../components/switch-darkMode"

import type { HeaderSectionProps } from './header-section';

const StyledDivider = styled('span')(({ theme }) => ({
  width: 1,
  height: 10,
  flexShrink: 0,
  display: 'none',
  position: 'relative',
  alignItems: 'center',
  flexDirection: 'column',
  marginLeft: theme.spacing(2.5),
  marginRight: theme.spacing(2.5),
  backgroundColor: 'currentColor',
  color: theme.vars.palette.divider,
  '&::before, &::after': {
    top: -5,
    width: 3,
    height: 3,
    content: '""',
    flexShrink: 0,
    borderRadius: '50%',
    position: 'absolute',
    backgroundColor: 'currentColor',
  },
  '&::after': { bottom: -5, top: 'auto' },
}));

export type HeaderBaseProps = HeaderSectionProps & {
  onOpenNav: () => void;
  onRouteHome: () => void;
  data?: {
    nav?: NavSectionProps['data'];
  };
  slots?: {
    navMobile?: {
      topArea?: React.ReactNode;
      bottomArea?: React.ReactNode;
    };
  };
  slotsDisplay?: {
    account?: boolean;
    menuButton?: boolean;
  };
};

export function HeaderBase({
  sx,
  data,
  slots,
  slotProps,
  onOpenNav,
  onRouteHome,
  layoutQuery,
  slotsDisplay: { account = true, menuButton = true } = {},
  ...other
}: HeaderBaseProps) {
  const { mode } = useColorScheme();

  const logo = useMemo(() => <img src={mode === 'dark' ? '/logo/logo-full-dark.svg' : '/logo/logo-full.svg'} width="128px" alt="Rooch logo" />, [mode]);

  return (
    <HeaderSection
      sx={sx}
      layoutQuery={layoutQuery}
      slots={{
        ...slots,
        leftAreaStart: slots?.leftAreaStart,
        leftArea: (
          <>
            {slots?.leftAreaStart}

            {/* -- Menu button -- */}
            {/* {menuButton && (
              <MenuButton
                data-slot="menu-button"
                onClick={onOpenNav}
                sx={{ mr: 1, ml: -1, [theme.breakpoints.up(layoutQuery)]: { display: 'none' } }}
              />
            )} */}
            <Button onClick={onRouteHome}>
              {logo}
            </Button>

            {/* -- Logo -- */}
            <Logo data-slot="logo" />


            {/* -- Divider -- */}
            <StyledDivider data-slot="divider" />

            {slots?.leftAreaEnd}
          </>
        ),
        rightArea: (
          <>
            {slots?.rightAreaStart}

            <Box
              data-area="right"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: { xs: 1, sm: 1.5 },
              }}
            >
              <SwitchDorkMode />
              <SwitchNetWork />
              {/* -- Account drawer -- */}
              {account && <AccountDrawer data-slot="account" />}

              {/* -- Purchase button -- */}
              {/* {purchase && (
                <Button
                  data-slot="purchase"
                  variant="contained"
                  rel="noopener"
                  target="_blank"
                  sx={{
                    display: 'none',
                    [theme.breakpoints.up(layoutQuery)]: { display: 'inline-flex' },
                  }}
                >
                  Purchase
                </Button>
              )} */}
            </Box>

            {slots?.rightAreaEnd}
          </>
        ),
      }}
      slotProps={slotProps}
      {...other}
    />
  );
}
