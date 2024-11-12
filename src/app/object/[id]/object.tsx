import React, {ReactNode} from "react";
import {Box, Chip, Skeleton, Stack} from "@mui/material";
import {varAlpha} from "../../../theme/styles";


function PropsKeyItem({ itemKey }: { itemKey: string }) {
  return <Box className="w-48 text-sm font-semibold text-gray-600">{itemKey}</Box>;
}

function PropsValueItem({ children, loading }: { children: ReactNode; loading?: boolean }) {
  if (loading) {
    return <Skeleton width="160px" height="16px" />;
  }
  return children;
}

const ObjectDetail = ({ object }: { object: any }) => <Stack
    spacing={2}
    className="p-4"
    sx={{
      borderRadius: 2,
      bgcolor: (theme) => varAlpha(theme.vars.palette.grey['500Channel'], 0.04),
      border: (theme) => `dashed 1px ${theme.vars.palette.divider}`,
    }}
  >
    <Stack direction="row" alignItems="center">
      <PropsKeyItem itemKey="Owner" />
      <PropsValueItem loading={!object}>
        {object?.owner && (
          <Box>
            <Chip
              label={object?.owner}
              size="small"
              variant="outlined"
              color="default"
            />
          </Box>
        )}
      </PropsValueItem>
    </Stack>
    <Stack direction="row" alignItems="center">
      <PropsKeyItem itemKey="Owner Bitcoin address" />
      <PropsValueItem loading={!object}>
        {
          object?.owner_bitcoin_address &&
          <Box>
            <Chip
              label={object?.owner_bitcoin_address}
              size="small"
              variant="outlined"
              color="default"
            />
          </Box>
        }
      </PropsValueItem>
    </Stack>
    <Stack direction="row" alignItems="center">
      <PropsKeyItem itemKey="Object Type" />
      <PropsValueItem loading={!object}>
        {
          object?.object_type &&
          <Box>
            <Chip
              label={object?.object_type}
              size="small"
              variant="outlined"
              color="default"
            />
          </Box>
        }
      </PropsValueItem>
    </Stack>
    <Stack direction="row" alignItems="center">
      <PropsKeyItem itemKey="Size" />
      <PropsValueItem loading={!object}>
        {
          object?.size &&
          <Box>
            <Chip
              label={object?.size}
              size="small"
              variant="outlined"
              color="default"
            />
          </Box>
        }
      </PropsValueItem>
    </Stack>
    <Stack direction="row" alignItems="center">
      <PropsKeyItem itemKey="State index" />
      <PropsValueItem loading={!object}>
        {
          object?.state_index &&
          <Box>
            <Chip
              label={object?.state_index}
              size="small"
              variant="outlined"
              color="default"
            />
          </Box>
        }
      </PropsValueItem>
    </Stack>
    <Stack direction="row" alignItems="center">
      <PropsKeyItem itemKey="State root" />
      <PropsValueItem loading={!object}>
        {
          object?.state_root &&
          <Box>
            <Chip
              label={object?.state_root}
              size="small"
              variant="outlined"
              color="default"
            />
          </Box>
        }
      </PropsValueItem>
    </Stack>
    <Stack direction="row" alignItems="center">
      <PropsKeyItem itemKey="Tx order" />
      <PropsValueItem loading={!object}>
        {
          object?.tx_order &&
          <Box>
            <Chip
              label={object?.tx_order}
              size="small"
              variant="outlined"
              color="default"
            />
          </Box>
        }
      </PropsValueItem>
    </Stack>
    <Stack direction="row" alignItems="center">
      <PropsKeyItem itemKey="Create Time" />
      <PropsValueItem loading={!object}>
        {
          object?.created_at &&
          <Box>
            <Chip
              label={new Date(Number(object?.created_at)).toLocaleString()}
              size="small"
              variant="outlined"
              color="default"
            />
          </Box>
        }
      </PropsValueItem>
    </Stack>
    <Stack direction="row" alignItems="center">
      <PropsKeyItem itemKey="Value" />
      <PropsValueItem loading={!object}>
        {
          object?.value &&
          <Box>
            <Chip
              label={object?.value}
              size="small"
              variant="outlined"
              color="default"
            />
          </Box>
        }
      </PropsValueItem>
    </Stack>


  </Stack>

export default ObjectDetail;
