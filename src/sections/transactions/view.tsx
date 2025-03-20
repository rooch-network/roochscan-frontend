'use client';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
import { isValidBitcoinAddress, isValidRoochAddress, RoochAddress } from '@roochnetwork/rooch-sdk';
import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';
import dayjs, { Dayjs } from 'dayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

import {
  Button,
  TextField,
  Stack,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Tabs,
  Tab,
} from '@mui/material';

import { useRouter, useSearchParams } from 'src/routes/hooks';
import useAddressChanged from 'src/routes/hooks/useAddressChanged';

import { BitcoinAddressToRoochAddress } from 'src/utils/address';

import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';

import TransactionsTableCard from './components/transactions-table-card';

interface FilterState {
  startTime: string;
  endTime: string;
  fromOrder: string;
  toOrder: string;
}

interface TempFilterState {
  filterType: 'time_range' | 'order_range' | 'none';
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  fromOrder: string;
  toOrder: string;
}

export function TransactionsView({ address }: { address: string }) {
  const searchParams = useSearchParams();
  const initialStartTime = searchParams.get('start_time') || '';
  const initialEndTime = searchParams.get('end_time') || '';
  const initialFromOrder = searchParams.get('from_order') || '';
  const initialToOrder = searchParams.get('to_order') || '';

  const [paginationModel, setPaginationModel] = useState({ index: 1, limit: 10 });
  const mapPageToNextCursor = useRef<{ [page: number]: string | null }>({});
  const router = useRouter();
  const [bitcoinAddress, setBitcoinAddress] = useState<string>();
  const [roochAddress, setRoochAddress] = useState<string>();
  const [roochBech32Address, setRoochBech32Address] = useState<string>();

  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  
  const [tempFilters, setTempFilters] = useState<TempFilterState>({
    filterType: 'time_range',
    startTime: initialStartTime ? dayjs(Number(initialStartTime)) : null,
    endTime: initialEndTime ? dayjs(Number(initialEndTime)) : null,
    fromOrder: initialFromOrder,
    toOrder: initialToOrder,
  });

  const [filters, setFilters] = useState<FilterState>({
    startTime: initialStartTime,
    endTime: initialEndTime,
    fromOrder: initialFromOrder,
    toOrder: initialToOrder,
  });

  useEffect(() => {
    if (isValidRoochAddress(address)) {
      const roochAddress = new RoochAddress(address);
      const roochHexAddress = roochAddress.toHexAddress();
      setRoochAddress(roochHexAddress);
      setRoochBech32Address(roochAddress.toBech32Address());
    } else if (isValidBitcoinAddress(address)) {
      setBitcoinAddress(address);
      try {
        const roochAddress = BitcoinAddressToRoochAddress(address!);
        setRoochAddress(roochAddress.toHexAddress());
        setRoochBech32Address(roochAddress.toBech32Address());
      } catch (error) {
        toast.error('Invalid query address');
        router.push('/search');
      }
    } else {
      toast.error('Invalid query address');
      router.push('/search');
    }
  }, [address, router]);

  useAddressChanged({
    address: bitcoinAddress,
    path: 'transactions',
  });

  const queryOptions = useMemo(
    () => ({
      cursor: mapPageToNextCursor.current[paginationModel.index - 1]?.toString(),
      limit: paginationModel.limit.toString(),
    }),
    [paginationModel]
  );

  const getFilter = () => {
    const baseFilter = {
      sender: roochBech32Address as string,
    };

    if (filters.fromOrder && filters.toOrder) {
      return {
        ...baseFilter,
        tx_order_range: {
          from_order: filters.fromOrder,
          to_order: filters.toOrder,
        },
      };
    }

    if (filters.startTime && filters.endTime) {
      return {
        ...baseFilter,
        time_range: {
          start_time: filters.startTime,
          end_time: filters.endTime,
        },
      };
    }

    return baseFilter;
  };

  const { data: transactionsList, isPending } = useRoochClientQuery(
    'queryTransactions',
    {
      filter: getFilter(),
      cursor: queryOptions.cursor,
      limit: queryOptions.limit,
    },
    { enabled: !!roochBech32Address }
  );

  useEffect(() => {
    if (!transactionsList) {
      return;
    }
    if (transactionsList.has_next_page) {
      mapPageToNextCursor.current[paginationModel.index] = transactionsList.next_cursor ?? null;
    }
  }, [paginationModel, transactionsList]);

  const updateURL = useCallback((pageIndex?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    ['start_time', 'end_time', 'from_order', 'to_order'].forEach(key => {
      params.delete(key);
    });
    
    if (filters.startTime) {
      params.set('start_time', filters.startTime);
    }
    if (filters.endTime) {
      params.set('end_time', filters.endTime);
    }
    if (filters.fromOrder) {
      params.set('from_order', filters.fromOrder);
    }
    if (filters.toOrder) {
      params.set('to_order', filters.toOrder);
    }
    
    router.push(`/transactions/${address}?${params.toString()}`);
  }, [filters, router, address, searchParams]);

  const paginate = (index: number): void => {
    if (index < 0) {
      return;
    }
    setPaginationModel({
      ...paginationModel,
      index,
    });
  };

  const handleFilterChange = (field: string, value: any) => {
    setTempFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenFilter = () => {
    let filterType: TempFilterState['filterType'] = 'time_range';
    if (filters.fromOrder && filters.toOrder) {
      filterType = 'order_range';
    }

    setTempFilters({
      filterType,
      startTime: filters.startTime ? dayjs(Number(filters.startTime)) : null,
      endTime: filters.endTime ? dayjs(Number(filters.endTime)) : null,
      fromOrder: filters.fromOrder,
      toOrder: filters.toOrder,
    });
    setOpenFilterDialog(true);
  };

  const handleCloseFilter = () => {
    setOpenFilterDialog(false);
  };

  const handleFilterTypeChange = (_: React.SyntheticEvent, newValue: TempFilterState['filterType']) => {
    setTempFilters(prev => ({
      ...prev,
      filterType: newValue,
      startTime: newValue === 'time_range' ? prev.startTime : null,
      endTime: newValue === 'time_range' ? prev.endTime : null,
      fromOrder: newValue === 'order_range' ? prev.fromOrder : '',
      toOrder: newValue === 'order_range' ? prev.toOrder : '',
    }));
  };

  const handleApplyFilters = () => {
    const newFilters: FilterState = {
      startTime: tempFilters.filterType === 'time_range' && tempFilters.startTime ? tempFilters.startTime.valueOf().toString() : '',
      endTime: tempFilters.filterType === 'time_range' && tempFilters.endTime ? tempFilters.endTime.valueOf().toString() : '',
      fromOrder: tempFilters.filterType === 'order_range' ? tempFilters.fromOrder : '',
      toOrder: tempFilters.filterType === 'order_range' ? tempFilters.toOrder : '',
    };
    
    setFilters(newFilters);
    setPaginationModel(prev => ({ ...prev, index: 1 }));
    mapPageToNextCursor.current = {};
    
    updateURL();
    handleCloseFilter();
  };

  const handleResetFilters = () => {
    const resetTempFilters: TempFilterState = {
      filterType: 'none',
      startTime: null,
      endTime: null,
      fromOrder: '',
      toOrder: '',
    };
    const resetFilters: FilterState = {
      startTime: '',
      endTime: '',
      fromOrder: '',
      toOrder: '',
    };
    setTempFilters(resetTempFilters);
    setFilters(resetFilters);
    setPaginationModel(prev => ({ ...prev, index: 1 }));
    mapPageToNextCursor.current = {};
    updateURL();
    handleCloseFilter();
  };

  return (
    <DashboardContent maxWidth="xl">
      <Button
        className="w-fit"
        onClick={() => {
          router.back();
        }}
        startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
      >
        Back
      </Button>

      <TransactionsTableCard
        address={address}
        isPending={isPending}
        transactionsList={transactionsList}
        paginationModel={paginationModel}
        paginate={paginate}
        onOpenFilter={handleOpenFilter}
      />

      <Dialog
        open={openFilterDialog}
        onClose={handleCloseFilter}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Filters
          <IconButton onClick={handleCloseFilter}>
            <Iconify icon="eva:close-fill" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={3}>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs 
                  value={tempFilters.filterType === 'none' ? false : tempFilters.filterType} 
                  onChange={handleFilterTypeChange}
                  variant="fullWidth"
                >
                  <Tab 
                    icon={<Iconify icon="mdi:clock-outline" width={20} />}
                    iconPosition="start"
                    label="Time Range" 
                    value="time_range"
                  />
                  <Tab 
                    icon={<Iconify icon="mdi:order-numeric-ascending" width={20} />}
                    iconPosition="start"
                    label="Order Range" 
                    value="order_range"
                  />
                </Tabs>
              </Box>
              
              {tempFilters.filterType === 'time_range' && (
                <Stack spacing={2}>
                  <DateTimePicker
                    label="Start Time"
                    value={tempFilters.startTime}
                    onChange={(newValue) => handleFilterChange('startTime', newValue)}
                    slotProps={{
                      textField: { 
                        fullWidth: true,
                        placeholder: 'Select start time'
                      },
                    }}
                  />
                  <DateTimePicker
                    label="End Time"
                    value={tempFilters.endTime}
                    onChange={(newValue) => handleFilterChange('endTime', newValue)}
                    slotProps={{
                      textField: { 
                        fullWidth: true,
                        placeholder: 'Select end time'
                      },
                    }}
                    minDate={tempFilters.startTime || undefined}
                  />
                </Stack>
              )}
              
              {tempFilters.filterType === 'order_range' && (
                <Stack spacing={2}>
                  <TextField
                    label="From Order"
                    value={tempFilters.fromOrder}
                    onChange={(e) => handleFilterChange('fromOrder', e.target.value)}
                    fullWidth
                    placeholder="Enter starting order number"
                  />
                  <TextField
                    label="To Order"
                    value={tempFilters.toOrder}
                    onChange={(e) => handleFilterChange('toOrder', e.target.value)}
                    fullWidth
                    placeholder="Enter ending order number"
                  />
                </Stack>
              )}
            </Stack>
          </LocalizationProvider>
        </DialogContent>

        <DialogActions>
          <Button color="inherit" onClick={handleResetFilters}>
            Clear
          </Button>
          <Button variant="contained" onClick={handleApplyFilters}>
            Apply
          </Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
