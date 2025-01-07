import type { IModule, FunctionDetail } from 'src/types';

import { useState, useEffect } from 'react';
import { fromHEX } from '@roochnetwork/rooch-sdk';

import { deserializeBcs } from 'src/utils/bcs';

interface DecodedArg {
  type: string;
  parsedType: string;
  raw: string;
  decoded: string;
}

interface UseDecodeArgsProps {
  moduleABI?: IModule;
  functionId?: string;
  args?: string[];
}

function isSigner(type: string): boolean {
  const cleanType = type.replace(/&mut\s*/g, '').replace(/&\s*/g, '');
  return cleanType === 'signer';
}

export function useDecodeArgs({ moduleABI, functionId, args }: UseDecodeArgsProps) {
  const [decodedArgs, setDecodedArgs] = useState<DecodedArg[]>([]);
  const [isDecodingArgs, setIsDecodingArgs] = useState(false);

  useEffect(() => {
    const parseType = (type: string): string => type.replace(/&mut\s+/, '').replace(/&\s+/, '');

    const decodeArgs = async () => {
      if (!moduleABI || !functionId || !args?.length) {
        return;
      }

      try {
        setIsDecodingArgs(true);
        const [_, __, functionName] = functionId.split('::');

        const functionABI = moduleABI.functions.find(
          (f: FunctionDetail) => f.name === functionName
        );

        if (!functionABI) {
          return;
        }

        const nonSignerParamCount = functionABI.params.filter(param => !isSigner(param)).length;
        const bcsArgs = args.slice(-nonSignerParamCount);

        const decoded = functionABI.params.map((paramType: string, index: number) => {
          try {
            if (isSigner(paramType)) {
              return {
                type: paramType,
                parsedType: parseType(paramType),
                raw: '',
                decoded: '',
              };
            }

            const bcsIndex = functionABI.params
              .slice(0, index)
              .filter(p => !isSigner(p))
              .length;
            const arg = bcsArgs[bcsIndex];

            if (!arg) {
              throw new Error(`Missing argument for parameter ${paramType}`);
            }

            const hexData = fromHEX(arg.slice(2));
            const decodedValue = deserializeBcs(hexData, paramType, moduleABI.structs);

            return {
              type: paramType,
              parsedType: parseType(paramType),
              raw: arg,
              decoded: typeof decodedValue === 'object' ? JSON.stringify(decodedValue, null, 2) : decodedValue?.toString() ?? 'Unable to decode'
            };
          } catch (error) {
            console.error('Failed to decode argument:', error);
            return {
              type: paramType,
              parsedType: parseType(paramType),
              raw: args[index] || '',
              decoded: 'Failed to decode'
            };
          }
        });

        setDecodedArgs(decoded);
      } catch (error) {
        console.error('Failed to decode args:', error);
      } finally {
        setIsDecodingArgs(false);
      }
    };

    decodeArgs();
  }, [moduleABI, functionId, args]);

  return {
    decodedArgs,
    isDecodingArgs,
  };
} 