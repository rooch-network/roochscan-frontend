'use client';

import { redirect } from 'next/navigation';
import { NetWorkPath } from '@/config/constant';
import { useNetwork } from '@/context/network-provider';


export default function Page({ params }: { params: { address: string } }) {
  const { network } = useNetwork();
  redirect(`/${NetWorkPath[network]}/transactions/${params.address}`);

}
