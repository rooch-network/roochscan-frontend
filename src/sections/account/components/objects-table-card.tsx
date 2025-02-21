import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneDark, duotoneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

import { 
  Card, 
  Table, 
  Stack, 
  TableBody, 
  CardHeader, 
  useColorScheme, 
  CircularProgress, 
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { TableNoData } from 'src/components/table';
import { Scrollbar } from 'src/components/scrollbar';

type ObjectData = {
  object_type: string;
  id: string;
  [key: string]: any;
};

function ObjectCard({ object }: { object: ObjectData }) {
  const { mode } = useColorScheme();

  return (
    <Accordion 
      sx={{ 
        bgcolor: 'background.neutral',
        '&:before': { display: 'none' },
        boxShadow: 'none',
      }}
    >
      <AccordionSummary 
        expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" />}
        sx={{
          '& .MuiAccordionSummary-content': {
            alignItems: 'flex-start',
          }
        }}
      >
        <Stack spacing={0.5}>
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            {object.object_type}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', wordBreak: 'break-all' }}>
            {object.id}
          </Typography>
        </Stack>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0 }}>
        <SyntaxHighlighter
          language="json"
          style={mode === 'light' ? duotoneLight : duotoneDark}
          customStyle={{
            margin: 0,
            padding: '16px',
            background: 'transparent',
            borderRadius: '0 0 8px 8px',
          }}
        >
          {JSON.stringify(object, null, 2)}
        </SyntaxHighlighter>
      </AccordionDetails>
    </Accordion>
  );
}

export default function ObjectsTableCard({ 
  address,
  dense,
  hideHeader 
}: { 
  address: string;
  dense?: boolean;
  hideHeader?: boolean;
}) {
  const { mode } = useColorScheme();

  const { data: objectsList, isPending } = useRoochClientQuery(
    'queryObjectStates',
    {
      filter: {
        owner: address,
      },
    },
    { enabled: !!address }
  );

  return (
    <Card className="mt-4">
      {!hideHeader && (
        <CardHeader
          title="Objects"
          subheader={dense ? undefined : `Account objects`}
          sx={{ mb: 3 }}
        />
      )}

      <Scrollbar sx={{ minHeight: dense ? undefined : 462 }}>
        {isPending ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center',
            height: dense ? 200 : 400
          }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {objectsList?.data && objectsList.data.length > 0 ? (
              <Stack spacing={1} sx={{ p: 2 }}>
                {objectsList.data.map((object, index) => (
                  <ObjectCard key={object.id} object={object} />
                ))}
              </Stack>
            ) : (
              <Table sx={{ minWidth: 720 }} size={dense ? 'small' : 'medium'}>
                <TableBody>
                  <TableNoData title="No Objects Found" notFound />
                </TableBody>
              </Table>
            )}
          </>
        )}
      </Scrollbar>
    </Card>
  );
} 