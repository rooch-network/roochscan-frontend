'use client';

import { TransactionsView } from 'src/sections/transactions/view';

export default function Page({ params }: { params: { address: string } }) {
  return <TransactionsView address={params.address} />;
}
