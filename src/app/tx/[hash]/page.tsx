'use client';

import { TxView } from 'src/sections/tx/view';

export default function Page({ params }: { params: { hash: string } }) {
  return <TxView hash={params.hash} />;
}
