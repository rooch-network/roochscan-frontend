'use client';

import { useRef, useMemo, useState, useEffect, useCallback } from 'react';
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
  Typography,
} from '@mui/material';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import useTimeRange from 'src/hooks/useTimeRange';

import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import TransactionsTableHome from 'src/sections/transactions/components/transactions-table-home';

interface FilterState {
  sender: string;
  startTime: string;
  endTime: string;
  fromOrder: string;
  toOrder: string;
}

interface TempFilterState {
  filterType: 'sender' | 'time_range' | 'order_range' | 'none';
  sender: string;
  startTime: Dayjs | null;
  endTime: Dayjs | null;
  fromOrder: string;
  toOrder: string;
}

export default function TransactionsView() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialOrder = searchParams.get('order');
  const initialLimit = parseInt(searchParams.get('limit') || '10', 10);
  const initialSender = searchParams.get('sender') || '';
  const initialStartTime = searchParams.get('start_time') || '';
  const initialEndTime = searchParams.get('end_time') || '';
  const initialFromOrder = searchParams.get('from_order') || '';
  const initialToOrder = searchParams.get('to_order') || '';

  const mapPageToNextCursor = useRef<{ [page: number]: string | null }>({});
  const isInitialRender = useRef(true);
  
  const [paginationModel, setPaginationModel] = useState({ 
    index: 1,
    limit: initialLimit
  });

  const [openFilterDialog, setOpenFilterDialog] = useState(false);
  
  const [tempFilters, setTempFilters] = useState<TempFilterState>({
    filterType: 'sender',
    sender: initialSender,
    startTime: initialStartTime ? dayjs(Number(initialStartTime)) : null,
    endTime: initialEndTime ? dayjs(Number(initialEndTime)) : null,
    fromOrder: initialFromOrder,
    toOrder: initialToOrder,
  });

  const [filters, setFilters] = useState<FilterState>({
    sender: initialSender,
    startTime: initialStartTime,
    endTime: initialEndTime,
    fromOrder: initialFromOrder,
    toOrder: initialToOrder,
  });

  const queryOptions = useMemo(
    () => ({
      cursor: mapPageToNextCursor.current[paginationModel.index - 1] || null,
      limit: paginationModel.limit.toString(),
    }),
    [paginationModel]
  );

  const updateURL = useCallback((pageIndex?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Clear existing filter params
    ['sender', 'start_time', 'end_time', 'from_order', 'to_order', 'order', 'limit'].forEach(key => {
      params.delete(key);
    });
    
    // Add current page order if exists
    const order = pageIndex ? mapPageToNextCursor.current[pageIndex - 1] : null;
    if (order) {
      params.set('order', order);
    }
    
    // Add filter params if they exist
    if (filters.sender) {
      params.set('sender', filters.sender);
    }
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
    
    // Always add limit
    params.set('limit', paginationModel.limit.toString());
    
    router.push(`/txs?${params.toString()}`);
  }, [filters, paginationModel.limit, router, searchParams]);

  const { fiveMinutesAgoMillis, currentTimeMillis } = useTimeRange(5000, false);

  const getFilter = () => {
    // If using cursor or initial order, prioritize these
    if (queryOptions.cursor) {
      return {
        tx_order_range: {
          from_order: "0",
          to_order: queryOptions.cursor,
        },
      };
    }

    if (initialOrder) {
      return {
        tx_order_range: {
          from_order: "0",
          to_order: initialOrder,
        },
      };
    }

    // Handle different filter types
    if (filters.sender) {
      return { sender: filters.sender };
    }

    if (filters.fromOrder && filters.toOrder) {
      return {
        tx_order_range: {
          from_order: filters.fromOrder,
          to_order: filters.toOrder,
        },
      };
    }

    if (filters.startTime && filters.endTime) {
      return {
        time_range: {
          start_time: filters.startTime,
          end_time: filters.endTime,
        },
      };
    }

    // Default to time range if no filters are active
    return {
      time_range: {
        start_time: fiveMinutesAgoMillis.toString(),
        end_time: currentTimeMillis.toString(),
      },
    };
  };

  const { data: transactionsList, isPending } = useRoochClientQuery('queryTransactions', {
    filter: getFilter(),
    cursor: queryOptions.cursor,
    limit: queryOptions.limit,
  });

  // Update URL on initial render if there are any filters
  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      const hasFilters = filters.sender || filters.startTime || filters.endTime || filters.fromOrder || filters.toOrder;
      if (hasFilters) {
        updateURL();
      }
    }
  }, [filters.sender, filters.startTime, filters.endTime, filters.fromOrder, filters.toOrder, updateURL]);

  useEffect(() => {
    if (!transactionsList?.has_next_page || !transactionsList?.next_cursor) {
      return;
    }

    // Store the cursor for next page
    const nextPageIndex = paginationModel.index + 1;
    mapPageToNextCursor.current[nextPageIndex] = transactionsList.next_cursor;

    // If we're on the first page
    if (paginationModel.index === 1) {
      if (initialOrder) {
        // If we have initial order, use it for first page
        mapPageToNextCursor.current[1] = initialOrder;
      } else {
        // If using timerange, store first page cursor
        mapPageToNextCursor.current[1] = transactionsList.next_cursor;
      }
    }
  }, [paginationModel.index, transactionsList, initialOrder]);

  const paginate = (index: number): void => {
    if (index < 0) {
      return;
    }
    setPaginationModel({
      ...paginationModel,
      index,
    });

    updateURL(index);
  };

  const handleFilterChange = (field: string, value: any) => {
    setTempFilters(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleOpenFilter = () => {
    // Determine filter type based on current filters, default to sender
    let filterType: TempFilterState['filterType'] = 'sender';
    if (filters.startTime && filters.endTime) {
      filterType = 'time_range';
    } else if (filters.fromOrder && filters.toOrder) {
      filterType = 'order_range';
    } else if (filters.sender) {
      filterType = 'sender';
    }

    setTempFilters({
      filterType,
      sender: filters.sender,
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
      // Reset other fields based on the new filter type
      sender: newValue === 'sender' ? prev.sender : '',
      startTime: newValue === 'time_range' ? prev.startTime : null,
      endTime: newValue === 'time_range' ? prev.endTime : null,
      fromOrder: newValue === 'order_range' ? prev.fromOrder : '',
      toOrder: newValue === 'order_range' ? prev.toOrder : '',
    }));
  };

  const handleApplyFilters = () => {
    // Convert dayjs objects to timestamps for API
    const newFilters: FilterState = {
      sender: tempFilters.filterType === 'sender' ? tempFilters.sender : '',
      startTime: tempFilters.filterType === 'time_range' && tempFilters.startTime ? tempFilters.startTime.valueOf().toString() : '',
      endTime: tempFilters.filterType === 'time_range' && tempFilters.endTime ? tempFilters.endTime.valueOf().toString() : '',
      fromOrder: tempFilters.filterType === 'order_range' ? tempFilters.fromOrder : '',
      toOrder: tempFilters.filterType === 'order_range' ? tempFilters.toOrder : '',
    };
    
    // Update filters and URL in one batch
    const params = new URLSearchParams(searchParams.toString());
    
    // Clear existing filter params
    ['sender', 'start_time', 'end_time', 'from_order', 'to_order', 'order', 'limit'].forEach(key => {
      params.delete(key);
    });
    
    // Add filter params based on filter type
    if (tempFilters.filterType === 'sender' && newFilters.sender) {
      params.set('sender', newFilters.sender);
    } else if (tempFilters.filterType === 'time_range' && newFilters.startTime && newFilters.endTime) {
      params.set('start_time', newFilters.startTime);
      params.set('end_time', newFilters.endTime);
    } else if (tempFilters.filterType === 'order_range' && newFilters.fromOrder && newFilters.toOrder) {
      params.set('from_order', newFilters.fromOrder);
      params.set('to_order', newFilters.toOrder);
    }
    
    // Always add limit
    params.set('limit', paginationModel.limit.toString());
    
    setFilters(newFilters);
    setPaginationModel(prev => ({ ...prev, index: 1 }));
    mapPageToNextCursor.current = {};
    
    router.push(`/txs?${params.toString()}`);
    handleCloseFilter();
  };

  const handleResetFilters = () => {
    const resetTempFilters: TempFilterState = {
      filterType: 'none',
      sender: '',
      startTime: null,
      endTime: null,
      fromOrder: '',
      toOrder: '',
    };
    const resetFilters: FilterState = {
      sender: '',
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
        className="w-fit mb-4"
        onClick={() => {
          router.push('/');
        }}
        startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
      >
        Back
      </Button>

      <TransactionsTableHome
        transactionsList={transactionsList}
        paginationModel={paginationModel}
        paginate={paginate}
        isPending={isPending}
        filterButton={
          <Button
            color="primary"
            onClick={handleOpenFilter}
            startIcon={<Iconify icon="ic:round-filter-list" />}
          >
            Filters
          </Button>
        }
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
                    icon={<Iconify icon="mdi:account" width={20} />}
                    iconPosition="start"
                    label="Sender" 
                    value="sender"
                  />
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

              {tempFilters.filterType === 'sender' && (
                <TextField
                  label="Sender Address"
                  value={tempFilters.sender}
                  onChange={(e) => handleFilterChange('sender', e.target.value)}
                  fullWidth
                  placeholder="Enter sender address"
                />
              )}
              
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
