import { RoochAddress, BitcoinAddress } from '@roochnetwork/rooch-sdk';
// Copyright (c) RoochNetwork
// SPDX-License-Identifier: Apache-2.0
// Author: Jason Jo

export function shortAddress(address: string | null | undefined, start = 6, end = 4): string {
  try {
    if (!address) {
      return '';
    }
    if (address.length <= start + end) {
      return address;
    }
    return `${address.substring(0, start)}...${address.substring(
      address.length - end,
      address.length
    )}`;
  } catch (error) {
    return '';
  }
}

export function BitcoinAddressToRoochAddress(bitcoinAddress: string) {
  return new BitcoinAddress(bitcoinAddress).genRoochAddress();
}

// show function call name
export const shotSentTo = (val:string) =>{
  if(!val) return ""
  const valList = val.split("::")
  return `${valList[1]  }::${ valList[valList.length -1]}`
}

export function RoochHexAddressToRoochBech32Address(roochHexAddress: string) {
  return new RoochAddress(roochHexAddress).toBech32Address();
}
