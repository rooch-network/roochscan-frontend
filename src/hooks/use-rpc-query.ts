import { useQuery } from '@tanstack/react-query';
import { useRoochClient, useCurrentNetwork } from '@roochnetwork/rooch-sdk-kit';

export function useRoochStatusQuery() {
  const network = useCurrentNetwork();
  const roochClient = useRoochClient();

  return useQuery({
    queryKey: [network, 'rpc.discover', []],
    queryFn: async () => (roochClient as any).transport.request({
        method: 'rooch_status',
        params: [],
      }),
  });
}
