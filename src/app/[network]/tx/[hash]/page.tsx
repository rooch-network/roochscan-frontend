import { TxView } from 'src/sections/tx/view';

export default function Page({ params }: { params: { network: string; hash: string } }) {
  return <TxView hash={params.hash} />;
} 