import { BcsReader, splitGenericParameters } from '@mysten/bcs';

interface StructField {
  name: string;
  type: string;
}

interface StructTag {
  address: string;
  module: string;
  name: string;
  typeParams: BcsTypeTag[];
}

type BcsTypeTag =
  | { bool: null }
  | { u8: null }
  | { u16: null }
  | { u32: null }
  | { u64: null }
  | { u128: null }
  | { u256: null }
  | { address: null }
  | { signer: null }
  | { vector: BcsTypeTag }
  | { struct: StructTag };

// 标准库地址
const MOVE_STD_ADDRESS = '0x1';
const MOVEOS_STD_ADDRESS = '0x2';
const ROOCH_FRAMEWORK_ADDRESS = '0x3';
const BITCOIN_MOVE_ADDRESS = '0x4';

// 内置结构体定义
interface StructDef {
  name: string;
  fields: StructField[];
}

const BUILTIN_STRUCTS: Record<string, StructDef> = {
  // Bitcoin Move (0x4)
  [`${BITCOIN_MOVE_ADDRESS}::utxo::UTXO`]: {
    name: 'UTXO',
    fields: [
      { name: 'txid', type: 'address' },
      { name: 'vout', type: 'u32' },
      { name: 'value', type: 'u64' },
      { name: 'seals', type: `${MOVEOS_STD_ADDRESS}::simple_multimap::SimpleMultiMap<${MOVE_STD_ADDRESS}::string::String, ${MOVEOS_STD_ADDRESS}::object::ObjectID>` }
    ]
  },
  // 可以继续添加其他内置结构体的定义
};

// 内置类型映射
const BUILTIN_TYPE_MAP: Record<string, string> = {
  // Move Stdlib (0x1)
  [`${MOVE_STD_ADDRESS}::string::String`]: 'string',
  [`${MOVE_STD_ADDRESS}::option::Option`]: 'option',
  [`${MOVE_STD_ADDRESS}::fixed_point32::FixedPoint32`]: 'u64',
  
  // MoveOS Stdlib (0x2)
  [`${MOVEOS_STD_ADDRESS}::object::Object`]: 'object',
  [`${MOVEOS_STD_ADDRESS}::object::ObjectID`]: 'object_id',
  [`${MOVEOS_STD_ADDRESS}::tx_context::TxContext`]: 'tx_context',
  [`${MOVEOS_STD_ADDRESS}::table::Table`]: 'table',
  [`${MOVEOS_STD_ADDRESS}::simple_map::SimpleMap`]: 'simple_map',
  [`${MOVEOS_STD_ADDRESS}::simple_multimap::SimpleMultiMap`]: 'simple_multimap',
  [`${MOVEOS_STD_ADDRESS}::event::Event`]: 'event',
  
  // Rooch Framework (0x3)
  [`${ROOCH_FRAMEWORK_ADDRESS}::coin::Coin`]: 'coin',
  [`${ROOCH_FRAMEWORK_ADDRESS}::coin::CoinStore`]: 'coin_store',
  [`${ROOCH_FRAMEWORK_ADDRESS}::account::Account`]: 'account',
  [`${ROOCH_FRAMEWORK_ADDRESS}::gas_coin::GasCoin`]: 'gas_coin',
  [`${ROOCH_FRAMEWORK_ADDRESS}::transaction::Transaction`]: 'transaction',
  
  // Bitcoin Move (0x4)
  [`${BITCOIN_MOVE_ADDRESS}::utxo::UTXO`]: 'utxo',
  [`${BITCOIN_MOVE_ADDRESS}::bitcoin::Bitcoin`]: 'bitcoin',
  [`${BITCOIN_MOVE_ADDRESS}::ord::Inscription`]: 'inscription',
  [`${BITCOIN_MOVE_ADDRESS}::types::BitcoinAddress`]: 'bitcoin_address',
  [`${BITCOIN_MOVE_ADDRESS}::types::BitcoinTxid`]: 'bitcoin_txid',
} as const;

const VECTOR_REGEX = /^vector<(.+)>$/;
const STRUCT_REGEX = /^([^:]+)::([^:]+)::([^<]+)(<(.+)>)?/;

function bytesToHexString(bytes: Uint8Array): string {
  return `0x${Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')}`;
}

function removeReferenceMarkers(type: string): string {
  return type.replace(/&mut\s*/g, '').replace(/&\s*/g, '');
}

function parseTypeTag(str: string, normalizeAddress = false): BcsTypeTag {
  const cleanType = removeReferenceMarkers(str);

  // 先尝试匹配结构体类型
  const structMatch = cleanType.match(STRUCT_REGEX);
  if (structMatch) {
    const [_, address, module, name, __, genericParams] = structMatch;
    const baseType = `${address}::${module}::${name}`;
    
    // 检查是否是内置类型
    const builtinType = BUILTIN_TYPE_MAP[baseType];
    if (builtinType) {
      switch (builtinType) {
        case 'string':
          return { struct: { address: MOVE_STD_ADDRESS, module: 'string', name: 'String', typeParams: [] } };
        case 'option':
          return { struct: { address: MOVE_STD_ADDRESS, module: 'option', name: 'Option', typeParams: [] } };
        case 'object': {
          const typeParams = genericParams ? parseStructTypeArgs(genericParams, normalizeAddress) : [];
          return { struct: { address: MOVEOS_STD_ADDRESS, module: 'object', name: 'Object', typeParams } };
        }
        case 'object_id':
          return { struct: { address: MOVEOS_STD_ADDRESS, module: 'object', name: 'ObjectID', typeParams: [] } };
        case 'utxo':
          return { struct: { address: BITCOIN_MOVE_ADDRESS, module: 'utxo', name: 'UTXO', typeParams: [] } };
        case 'bitcoin':
          return { struct: { address: BITCOIN_MOVE_ADDRESS, module: 'bitcoin', name: 'Bitcoin', typeParams: [] } };
        case 'inscription':
          return { struct: { address: BITCOIN_MOVE_ADDRESS, module: 'ord', name: 'Inscription', typeParams: [] } };
        case 'bitcoin_address':
          return { struct: { address: BITCOIN_MOVE_ADDRESS, module: 'types', name: 'BitcoinAddress', typeParams: [] } };
        case 'bitcoin_txid':
          return { struct: { address: BITCOIN_MOVE_ADDRESS, module: 'types', name: 'BitcoinTxid', typeParams: [] } };
        default:
          return { struct: { 
            address, 
            module, 
            name, 
            typeParams: genericParams ? parseStructTypeArgs(genericParams, normalizeAddress) : [] 
          } };
      }
    }

    // 如果不是内置类型，返回普通结构体类型
    return {
      struct: {
        address,
        module,
        name,
        typeParams: genericParams ? parseStructTypeArgs(genericParams, normalizeAddress) : [],
      },
    };
  }

  if (cleanType === 'address') {
    return { address: null };
  }
  if (cleanType === 'bool') {
    return { bool: null };
  }
  if (cleanType === 'u8') {
    return { u8: null };
  }
  if (cleanType === 'u16') {
    return { u16: null };
  }
  if (cleanType === 'u32') {
    return { u32: null };
  }
  if (cleanType === 'u64') {
    return { u64: null };
  }
  if (cleanType === 'u128') {
    return { u128: null };
  }
  if (cleanType === 'u256') {
    return { u256: null };
  }
  if (cleanType === 'signer') {
    return { signer: null };
  }

  const vectorMatch = cleanType.match(VECTOR_REGEX);
  if (vectorMatch) {
    return {
      vector: parseTypeTag(vectorMatch[1], normalizeAddress),
    };
  }

  throw new Error(`Unexpected token when parsing type args for ${str}`);
}

function parseStructTypeArgs(str: string, normalizeAddress = false): BcsTypeTag[] {
  return splitGenericParameters(str).map((tok) => parseTypeTag(tok, normalizeAddress));
}

export class BcsDeserializer {
  private reader: BcsReader;

  private structs: any[];

  constructor(data: Uint8Array, structs: any[] = []) {
    this.reader = new BcsReader(data);
    this.structs = structs;
  }

  private findStructByFullName(fullName: string): any {
    // 首先检查是否是内置结构体
    const builtinStruct = BUILTIN_STRUCTS[fullName];
    if (builtinStruct) {
      return builtinStruct;
    }

    // 如果不是内置结构体，则从传入的 structs 中查找
    const structName = fullName.split('::').pop()?.replace('>', '').trim();
    return this.structs.find(s => s.name === structName);
  }

  private readULEB(): number {
    let value = 0;
    let shift = 0;

    try {
      while (shift < 64) {
        const byte = this.reader.read8();
        value += (byte % 128) * (2 ** shift);
        if (byte < 128) {
          return value;
        }
        shift += 7;
      }
      throw new Error('ULEB128 value is too big');
    } catch (error) {
      if (error instanceof RangeError) {
        throw new Error('Reached end of buffer while reading ULEB128');
      }
      throw error;
    }
  }

  private safeReadBytes(length: number): Uint8Array {
    try {
      return this.reader.readBytes(length);
    } catch (error) {
      if (error instanceof RangeError) {
        throw new Error(`Cannot read ${length} bytes: buffer overflow`);
      }
      throw error;
    }
  }

  private deserializeVector(innerType: string): any[] {
    const length = this.readULEB();
    if (length > 1024) { // 添加合理的长度限制
      throw new Error(`Vector length ${length} exceeds maximum allowed length`);
    }
    return Array.from({ length }, () => this.deserialize(innerType));
  }

  private deserializeOption(innerType: string): any {
    const isSome = this.reader.read8() === 1;
    if (!isSome) {
      return null;
    }
    return this.deserialize(innerType);
  }

  private deserializeObjectID(): string {
    // ObjectID 包含一个地址向量
    const length = this.readULEB();
    if (length > 1024) {
      throw new Error(`Vector length ${length} exceeds maximum allowed length`);
    }
    // 将所有地址拼接成一个长地址
    const bytes = new Uint8Array(32 * length);
    for (let i = 0; i < length; i += 1) {
      const addressBytes = this.safeReadBytes(32);
      bytes.set(addressBytes, i * 32);
    }
    return bytesToHexString(bytes);
  }

  private deserializeObject(typeParams: BcsTypeTag[]): string {
    // 只需要解析 ObjectID
    return this.deserializeObjectID();
  }

  private deserializeSimpleMultiMap(keyType: string, valueType: string): any {
    // SimpleMultiMap 在 BCS 中的表示是一个 vector<(K, vector<V>)>
    const length = this.readULEB();
    if (length > 1024) {
      throw new Error(`SimpleMultiMap length ${length} exceeds maximum allowed length`);
    }
    const entries: Record<string, any[]> = {};
    for (let i = 0; i < length; i += 1) {
      const key = this.deserialize(keyType);
      const values = this.deserialize(`vector<${valueType}>`);
      entries[key] = values;
    }
    return entries;
  }

  public deserialize(type: string): any {
    const typeTag = parseTypeTag(type);
    
    try {
      if ('bool' in typeTag) {
        return this.reader.read8() === 1;
      }
      if ('u8' in typeTag) {
        return this.reader.read8();
      }
      if ('u16' in typeTag) {
        return this.reader.read16();
      }
      if ('u32' in typeTag) {
        return this.reader.read32();
      }
      if ('u64' in typeTag) {
        return this.reader.read64();
      }
      if ('u128' in typeTag) {
        return this.reader.read128();
      }
      if ('u256' in typeTag) {
        return this.reader.read256();
      }
      if ('signer' in typeTag) {
        // signer 类型不需要从 BCS 数据中读取，直接返回 null
        return null;
      }
      if ('address' in typeTag) {
        return bytesToHexString(this.safeReadBytes(32));
      }
      if ('vector' in typeTag) {
        return this.deserializeVector(tagToString(typeTag.vector));
      }
      if ('struct' in typeTag) {
        const { address, module, name, typeParams } = typeTag.struct;
        const fullName = `${address}::${module}::${name}`;
        
        if (module === 'string' && name === 'String') {
          const length = this.readULEB();
          if (length > 1024 * 1024) {
            throw new Error(`String length ${length} exceeds maximum allowed length`);
          }
          const bytes = this.safeReadBytes(length);
          return new TextDecoder().decode(bytes);
        }

        if (module === 'option' && name === 'Option') {
          return this.deserializeOption(tagToString(typeParams[0]));
        }


        if (module === 'object' && name === 'ObjectID') {
          return this.deserializeObjectID();
        }

        if (module === 'object' && name === 'Object') {
          return this.deserializeObject(typeParams);
        }

        if (module === 'simple_multimap' && name === 'SimpleMultiMap') {
          const [keyType, valueType] = typeParams;
          return this.deserializeSimpleMultiMap(tagToString(keyType), tagToString(valueType));
        }

        const structDef = this.findStructByFullName(fullName);
        if (structDef) {
          const result: Record<string, any> = {};
          structDef.fields.forEach((field: StructField) => {
            try {
              const value = this.deserialize(field.type);
              result[field.name] = value;
            } catch (error) {
              console.error(`Error parsing field ${field.name}:`, error);
              result[field.name] = null;
            }
          });
          return result;
        }

        return bytesToHexString(this.safeReadBytes(32));
      }

      throw new Error(`Unknown type tag: ${JSON.stringify(typeTag)}`);
    } catch (error) {
      console.error('Error deserializing field:', {
        type,
        typeTag,
        error,
      });
      throw error;
    }
  }
}

function tagToString(tag: BcsTypeTag): string {
  if ('bool' in tag) {
    return 'bool';
  }
  if ('u8' in tag) {
    return 'u8';
  }
  if ('u16' in tag) {
    return 'u16';
  }
  if ('u32' in tag) {
    return 'u32';
  }
  if ('u64' in tag) {
    return 'u64';
  }
  if ('u128' in tag) {
    return 'u128';
  }
  if ('u256' in tag) {
    return 'u256';
  }
  if ('address' in tag) {
    return 'address';
  }
  if ('signer' in tag) {
    return 'signer';
  }
  if ('vector' in tag) {
    return `vector<${tagToString(tag.vector)}>`;
  }
  if ('struct' in tag) {
    const {struct} = tag;
    const typeParams = struct.typeParams.map(tagToString).join(', ');
    return `${struct.address}::${struct.module}::${struct.name}${typeParams ? `<${typeParams}>` : ''}`;
  }
  throw new Error('Invalid TypeTag');
}

export function deserializeBcs(data: Uint8Array, type: string, structs: any[] = []): any {
  const deserializer = new BcsDeserializer(data, structs);
  return deserializer.deserialize(type);
}