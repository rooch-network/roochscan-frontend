import type { ArgType } from '@roochnetwork/rooch-sdk';

import { Args } from '@roochnetwork/rooch-sdk';

export const parseParamType = (key: string): string =>
  key.replace(/\d+$/, (match) => {
    if (key.length === match.length + 1 && key[0] === 'u') {
      return match;
    }
    return '';
  });

export const getDefaultValue = (paramType: string) => {
  const typeDefaults: Record<string, any> = {
    u8: '0',
    u16: '0',
    u32: '0',
    u64: '0',
    u128: '0',
    u256: '0',
    bool: 'false',
    string: '',
    address: '0x0',
    vector: [],
  };

  const matchedType = Object.keys(typeDefaults).find((type) => paramType.includes(type));
  return matchedType ? typeDefaults[matchedType] : '';
};

export const processValue = (value: any, paramType: string) => {
  if (!value && value !== false && value !== 0) {
    return getTypeConvert(paramType, getDefaultValue(paramType));
  }

  let processedValue = value;

  if (paramType.includes('vector')) {
    processedValue = processVectorValue(value, paramType);
  } else {
    processedValue = processSingleValue(value, paramType);
  }

  return getTypeConvert(paramType, processedValue);
};

const processVectorValue = (value: string, paramType: string) => {
  const elements = value
    .trim()
    .replace(/^\s*\[\s*|\s*\]\s*$/g, '')
    .split(/\s*,\s*/)
    .map((v) => v.trim().replace(/^["']|["']$/g, ''))
    .filter(Boolean);

  const innerType = paramType.match(/vector<(.+)>/)?.[1];
  if (!innerType) return elements;

  return elements.map((element) => convertElementByType(element, innerType));
};

const convertElementByType = (element: string, type: string) => {
  if (type.match(/u(8|16|32|64|128|256)/)) {
    return Number(element);
  }
  if (type === 'bool') {
    return element.toLowerCase() === 'true';
  }
  return element;
};

const processSingleValue = (value: any, paramType: string) => {
  if (typeof value === 'string') {
    value = value.trim();
  }

  if (paramType.match(/u(8|16|32|64|128|256)/)) {
    return Number(value);
  }
  if (paramType === 'bool') {
    return String(value).toLowerCase() === 'true';
  }
  if (paramType.includes('struct')) {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
};

export const getTypeConvert = (typeName: string, value: any) => {
  const cleanTypeName = typeName.replace(/&mut\s*/g, '').replace(/&\s*/g, '');

  if (cleanTypeName.includes('vector')) {
    if (cleanTypeName.includes('u8'))
      return Args.vec(
        'u8',
        value.map((v: string) => Number(v))
      );
    if (cleanTypeName.includes('string')) return Args.vec('string', value);
    if (cleanTypeName.includes('bool')) return Args.vec('bool', value);
    if (cleanTypeName.includes('address')) return Args.vec('address', value);
    if (cleanTypeName.includes('u16'))
      return Args.vec('u16', value.map((v: string) => Number(v)));
    if (cleanTypeName.includes('u32'))
      return Args.vec('u32', value.map((v: string) => Number(v)));
    if (cleanTypeName.includes('u64'))
      return Args.vec('u64', value.map((v: string) => BigInt(v)));
    if (cleanTypeName.includes('u128'))
      return Args.vec('u128', value.map((v: string) => BigInt(v)));
    if (cleanTypeName.includes('u256'))
      return Args.vec('u256', value.map((v: string) => BigInt(v)));
    if (cleanTypeName.includes('ObjectID')) return Args.vec('objectId', value);
    if (cleanTypeName.includes('Object')) return Args.vec('object', value);

    return Args.vec(cleanTypeName as ArgType, value);
  }

  if (cleanTypeName.includes('string')) return Args.string(value);
  if (cleanTypeName.includes('ObjectID')) return Args.objectId(value);
  if (cleanTypeName.includes('Object')) return Args.object(value);
  if (cleanTypeName.includes('u8')) return Args.u8(Number(value));
  if (cleanTypeName.includes('u16')) return Args.u16(Number(value));
  if (cleanTypeName.includes('u32')) return Args.u32(Number(value));
  if (cleanTypeName.includes('u64')) return Args.u64(BigInt(value));
  if (cleanTypeName.includes('u128')) return Args.u128(BigInt(value));
  if (cleanTypeName.includes('u256')) return Args.u256(BigInt(value));
  if (cleanTypeName.includes('bool')) return Args.bool(value);
  if (cleanTypeName.includes('address')) return Args.address(value);
  if (cleanTypeName.includes('struct')) {
    try {
      return Args.struct(JSON.parse(value));
    } catch {
      return Args.struct(value);
    }
  }

  return Args.address(value);
};
