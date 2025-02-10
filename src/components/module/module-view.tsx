import './module-view.css';

import type { FunctionDetail } from '@/types';
import type { ArgType} from '@roochnetwork/rooch-sdk';
import type { ModuleABIView } from '@roochnetwork/rooch-sdk/src/client/types';

import { Form, Input, message } from 'antd';
import React, { useMemo, useState, useEffect } from 'react';
import { Args, Transaction } from '@roochnetwork/rooch-sdk';
import {
  useRoochClient,
  useCurrentWallet,
  useCurrentAddress,
  useRoochClientQuery,
  // useSignAndExecuteTransaction,
} from '@roochnetwork/rooch-sdk-kit';

// import { useTheme } from '@mui/material/styles';
import {
  Stack,
  Button,
  useColorScheme,
} from '@mui/material';

export const ModuleView = ({ 
  moduleId, 
  moduleName,
}: { 
  moduleId: string;
  moduleName?: string;
}) => {
  const { mode } = useColorScheme();
  // const theme = useTheme();
  const isDark = mode === 'dark';
  const { data: module } = useRoochClientQuery('getModuleAbi', {
    moduleAddr: moduleId,
    moduleName: moduleName || '',
  }, {
    enabled: !!moduleName
  });

  const moduleDetail = useMemo(() => module, [module]);

  if (!moduleDetail) {
    return null;
  }

  return (
    <Stack>
      <ModuleDetail moduleDetail={moduleDetail} isDark={isDark} />
    </Stack>
  );
};

const ModuleDetail = ({ moduleDetail, isDark }: { moduleDetail: ModuleABIView; isDark: boolean }) => {
  const [currentFunc, setCurrentFunc] = useState<string>();
  const funcMap = useMemo(
    () => convertToFunctionDetailMap(moduleDetail?.functions),
    [moduleDetail]
  );

  return (
    <div className="container mx-auto flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/3 lg:w-1/4">
        <div className="sticky top-4">
          <div style={{ 
            fontSize: '1.125rem',
            fontWeight: 600,
            marginBottom: '1rem',
            color: isDark ? '#e5e7eb' : 'inherit'
          }}>
            Functions
          </div>
          {moduleDetail?.functions.map((item) => (
            <button
              type="button"
              key={item.name}
              onClick={() => setCurrentFunc(item.name)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '0.75rem 1rem',
                borderRadius: '0.5rem',
                marginBottom: '0.5rem',
                transition: 'all 0.2s',
                border: '1px solid',
                borderColor: isDark ? '#2d3949' : '#e5e7eb',
                background: currentFunc === item.name 
                  ? (isDark ? '#2d3949' : '#e5e7eb')
                  : (isDark ? '#1a1f2e' : '#f9fafb'),
                color: currentFunc === item.name
                  ? (isDark ? '#e5e7eb' : '#111827')
                  : (isDark ? '#d1d5db' : 'inherit'),
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = currentFunc === item.name
                  ? (isDark ? '#242b3d' : '#d1d5db')
                  : (isDark ? '#242b3d' : '#f3f4f6');
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = currentFunc === item.name
                  ? (isDark ? '#2d3949' : '#e5e7eb')
                  : (isDark ? '#1a1f2e' : '#f9fafb');
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full md:w-2/3 lg:w-3/4 min-h-[300px]">
        {currentFunc ? (
          <MethodCall func={funcMap.get(currentFunc)!} moduleDetail={moduleDetail} isDark={isDark} />
        ) : (
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: isDark ? '#9ca3af' : '#6b7280'
          }}>
            Select a function to view details
          </div>
        )}
      </div>
    </div>
  );
};

const MethodCall = ({ 
  moduleDetail, 
  func,
  isDark 
}: { 
  moduleDetail: ModuleABIView; 
  func: FunctionDetail;
  isDark: boolean;
}) => {
  // const sessionKey = useCurrentSession();
  const address = useCurrentAddress();
  // const { mutateAsync: createSessionKey } = useCreateSessionKey();
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [loading, setLoading] = useState(false);
  // const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const client = useRoochClient()
  const { wallet } = useCurrentWallet()
  // eslint-disable-next-line consistent-return
  const handleSubmit = async () => {
    try {
      if (loading) return undefined;
      
      setLoading(true);

      const params = form.getFieldsValue();
      const paramsArr = Object.keys(params).map(key => {
        const value = params[key];
        const paramType = key.replace(/\d+$/, '');
        
        // 如果值为空，对于数组类型返回空数组，其他类型返回默认值
        if (!value && value !== false && value !== 0) {
          if (paramType.includes('vector')) {
            return getTypeConvert(paramType, []);
          }
          // 对于其他类型，返回对应的默认值
          if (paramType.includes('u8')) return getTypeConvert(paramType, '0');
          if (paramType.includes('u16')) return getTypeConvert(paramType, '0');
          if (paramType.includes('u32')) return getTypeConvert(paramType, '0');
          if (paramType.includes('u64')) return getTypeConvert(paramType, '0');
          if (paramType.includes('u128')) return getTypeConvert(paramType, '0');
          if (paramType.includes('u256')) return getTypeConvert(paramType, '0');
          if (paramType.includes('bool')) return getTypeConvert(paramType, 'false');
          if (paramType.includes('string')) return getTypeConvert(paramType, '');
          if (paramType.includes('address')) return getTypeConvert(paramType, '0x0');
        }

        // 预处理输入值
        let processedValue = value;
        
        // 根据类型处理输入值
        if (paramType.includes('vector')) {
          // 处理数组输入
          processedValue = value
            .trim()
            // 尝试解析 JSON 字符串
            .replace(/^\s*\[\s*|\s*\]\s*$/g, '')  // 先移除外层的方括号
            .split(/\s*,\s*/)                      // 按逗号分割
            .map((v: string) => 
               v.trim().replace(/^["']|["']$/g, '')
            )
          
          // 对数组中的每个元素根据内部类型进行转换
          const innerType = paramType.match(/vector<(.+)>/)?.[1];
          if (innerType) {
            processedValue = processedValue.map((v: string) => {
              if (innerType.includes('u8') || innerType.includes('u16') || innerType.includes('u32') || innerType.includes('u64') || innerType.includes('u128') || innerType.includes('u256')) return Number(v);
              if (innerType.includes('bool')) return v.toLowerCase() === 'true';
              return v;
            });
          }
        } else {
          // 处理非数组类型
          if (typeof processedValue === 'string') {
            processedValue = processedValue.trim();
          }
          
          // 根据类型转换值
          if (paramType.includes('u8') || 
              paramType.includes('u16') || 
              paramType.includes('u32') ||
              paramType.includes('u64') || 
              paramType.includes('u128') || 
                     paramType.includes('u256')) {
            processedValue = Number(processedValue);
          } else if (paramType.includes('bool')) {
            processedValue = processedValue.toLowerCase() === 'true';
          } else if (paramType.includes('struct')) {
            try {
              processedValue = JSON.parse(processedValue);
            } catch {
              // 如果解析失败，保持原始值
            }
          }
        }
        
        return getTypeConvert(paramType, processedValue);
      });

      const typeParams = Object.values(form1.getFieldsValue()) as any[];

      // 检查函数定义中是否包含 &signer
      const hasSigner = func.params.includes('&signer');
      
      // 检查是否是 entry 函数
      const isEntry = func.is_entry;
      
      // 检查是否有返回值
      // const hasReturnValue = func.return && func.return.length > 0;

      if (hasSigner || isEntry) {
        if (!address) {
          setLoading(false);
          return await message.info('Please connect wallet!');
        }
        // 需要签名的交易
        const txn = new Transaction();
        txn.callFunction({
          address: moduleDetail.address,
          module: moduleDetail.name,
          function: func.name,
          args: [...paramsArr],
          typeArgs: [...typeParams],
        });
        
        const result = await client.signAndExecuteTransaction({
          transaction: txn,
          signer: wallet!,
        });
        
        
        // 错误处理
        if (result.execution_info.status.type === 'executed') {
          message.success(`Transaction executed: ${result.execution_info.tx_hash}`);
        } else if (result.execution_info.status.type === 'moveabort') {
          // 处理 Move abort 错误
          const errorCode = result.execution_info.status.abort_code;
          message.error(`Transaction failed with code: ${errorCode}`);
        } else {
          message.error(`Transaction failed: ${result.execution_info.status.type}`);
        }
        
      } else {
        // 查询操作
        const result = await client.executeViewFunction({
          target: `${moduleDetail.address}::${moduleDetail.name}::${func.name}`,
          args: [...paramsArr],
          typeArgs: [...typeParams],
        });
        
        // 错误处理和返回值解析
        console.log('Return values:', result);
        if (result.vm_status === 'Executed') {
          if (result.return_values && result.return_values.length > 0) {
            const formattedValues = result.return_values.map(item => {
              if (item.decoded_value !== undefined && item.decoded_value !== null) {
                return typeof item.decoded_value === 'object' ? JSON.stringify(item.decoded_value) : item.decoded_value;
              }
              return formatReturnValue(item.value.value, item.value.type_tag);
            });

            const displayValue = formattedValues.length === 1 
              ? formattedValues[0] 
              : formattedValues;

            message.success({
              content: (
                <div>
                  <div style={{ fontWeight: 500 }}>
                    Operation executed successfully
                  </div>
                  <div style={{ 
                    color: '#666',
                    fontSize: '0.9em',
                    wordBreak: 'break-all',
                    textAlign: 'left',
                  }}>
                    Return Data: {String(displayValue)}
                  </div>
                </div>
              ),
              duration: 4,
            });
          } else {
            message.success({
              content: 'Operation executed successfully',
            });
          }
        } else if (typeof result.vm_status === 'object') {
          if('MoveAbort' in result.vm_status) {
            const errorCode = result.vm_status.MoveAbort.abort_code;
            message.error(`Operation failed with code: ${errorCode}`);
          } else if('Error' in result.vm_status) {
            const errorCode = result.vm_status.Error
            message.error(`Operation failed with code: ${errorCode}`);
          } else {
            message.error('Operation failed');
          }
        } else {
          message.error('Operation failed');
        }
      }
      
    } catch (error: any) {
      console.log('error', error);
      const errorMessage = error.message || 'Unknown error occurred';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 格式化返回值显示
  const formatReturnValue = (value: any, type: string) => {
    try {
      if (value === null || value === undefined) {
        return 'null';
      }

      switch (type) {
        case 'u8':
        case 'u16':
        case 'u32':
        case 'u64':
        case 'u128':
        case 'u256':
          return Number(value).toString();
        case 'bool':
          return value ? 'true' : 'false';
        case 'address':
          return value.toString();
        case 'vector<u8>':
          return `0x${Buffer.from(value).toString('hex')}`;
        case 'string':
          return value.toString();
        default:
          return JSON.stringify(value);
      }
    } catch (error) {
      console.error('Error formatting return value:', error);
      return String(value);
    }
  };

  useEffect(() => {
    form.resetFields();
    form1.resetFields();
  }, [form, form1, func]);

  return (
    <div style={{
      background: isDark ? '#1a1f2e' : '#ffffff',
      borderRadius: '0.5rem',
      padding: '1.5rem',
    }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3 style={{
          fontSize: '1.25rem',
          fontWeight: 600,
          marginBottom: '0.5rem',
          color: isDark ? '#e5e7eb' : 'inherit'
        }}>
          {func.name}
        </h3>
        <div style={{
          fontSize: '0.875rem',
          color: isDark ? '#9ca3af' : '#6b7280'
        }}>
          Module: {moduleDetail.name}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <Form form={form} layout="vertical" className="w-full lg:w-1/2">
          <div className="space-y-4">
            {func?.params
              .filter((item) => item !== '&signer')
              .map((item, index) => (
                <Form.Item
                  key={`param-${index}`}
                  name={`${item}${index}`}
                  label={<div style={{ color: isDark ? '#d1d5db' : 'inherit', fontWeight: 500 }}>{item}</div>}
                  rules={[{ required: true }]}
                >
                  <Input
                    placeholder={item}
                    style={{
                      background: isDark ? '#242b3d' : '#f9fafb',
                      color: isDark ? '#e5e7eb' : 'inherit',
                      borderColor: isDark ? '#2d3949' : undefined,
                    }}
                    className={isDark ? 'dark-mode-input' : ''}
                  />
                </Form.Item>
              ))}
          </div>
        </Form>

        <Form form={form1} layout="vertical" className="w-full lg:w-1/2">
          <div className="space-y-4">
            {func?.type_params.map((item, index) => (
              <Form.Item
                key={`type-param-${index}`}
                name={index}
                label={<div style={{ color: isDark ? '#d1d5db' : 'inherit', fontWeight: 500 }}>{`Type Argument ${index + 1}`}</div>}
                rules={[{ required: true }]}
              >
                <Input
                  placeholder={item.constraints[1]}
                  style={{
                    background: isDark ? '#242b3d' : '#f9fafb',
                    color: isDark ? '#e5e7eb' : 'inherit',
                    borderColor: isDark ? '#2d3949' : undefined,
                  }}
                  className={isDark ? 'dark-mode-input' : ''}
                />
              </Form.Item>
            ))}
          </div>
        </Form>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          variant="text"
          onClick={handleSubmit}
          disabled={loading}
          sx={{
            px: 3,
            py: 1,
            minWidth: 0,
            boxShadow: 'none',
            bgcolor: 'transparent',
            border: '1px solid',
            borderColor: isDark ? '#2d3949' : '#e5e7eb',
            color: loading
              ? (isDark ? '#9ca3af' : '#6b7280')
              : (isDark ? '#e5e7eb' : '#111827'),
            '&:hover': {
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              boxShadow: 'none',
            }
          }}
        >
          {loading ? 'Executing...' : 'Execute'}
        </Button>
      </div>
    </div>
  );
};

function convertToFunctionDetailMap(functions?: FunctionDetail[]): Map<string, FunctionDetail> {
  if (!functions) {
    return new Map<string, FunctionDetail>();
  }
  const functionDetailMap = new Map<string, FunctionDetail>();
  functions!.forEach((func) => {
    functionDetailMap.set(func.name, func);
  });
  return functionDetailMap;
}

const getTypeConvert = (typeName: string, value: any) => {
  // 清理类型名称，移除引用标记
  const cleanTypeName = typeName.replace(/&mut\s*/g, '').replace(/&\s*/g, '');

  // 处理向量类型
  if (cleanTypeName.includes('vector')) {
    if (cleanTypeName.includes('u8')) {
      return Args.vec('u8', value.map((v: string) => Number(v)));
    }
    if (cleanTypeName.includes('string')) {
      return Args.vec('string', value);
    }
    if (cleanTypeName.includes('bool')) {
      return Args.vec('bool', value.map((v: string) => v.toLowerCase() === 'true'));
    }
    if (cleanTypeName.includes('address')) {
      return Args.vec('address', value);
    }
    return Args.vec(cleanTypeName as ArgType, value);
  }

  // 处理基本类型
  if (cleanTypeName.includes('string')) {
    return Args.string(value);
  }
  if (cleanTypeName.includes('object')) {
    return Args.objectId(value);
  }
  // 数字类型处理
  if (cleanTypeName.includes('u8')) {
    return Args.u8(Number(value));
  }
  if (cleanTypeName.includes('u16')) {
    return Args.u16(Number(value));
  }
  if (cleanTypeName.includes('u32')) {
    return Args.u32(Number(value));
  }
  if (cleanTypeName.includes('u64')) {
    return Args.u64(BigInt(value));
  }
  if (cleanTypeName.includes('u128')) {
    return Args.u128(BigInt(value));
  }
  if (cleanTypeName.includes('u256')) {
    return Args.u256(BigInt(value));
  }
  if (cleanTypeName.includes('bool')) {
    return Args.bool(value.toLowerCase() === 'true');
  }
  if (cleanTypeName.includes('address')) {
    return Args.address(value);
  }
  if (cleanTypeName.includes('struct')) {
    try {
      // 尝试解析JSON字符串
      const parsed = JSON.parse(value);
      return Args.struct(parsed);
    } catch {
      return Args.struct(value);
    }
  }
  
  return Args.address(value);
}; 