import { AccountView } from 'src/sections/account/view';

export default function Page({ params }: { params: { address: string } }) {
  return <AccountView address={params.address} />;
}
