import './module-view.css';

import type { FunctionDetail } from '@/types';
import type { ModuleABIView } from '@roochnetwork/rooch-sdk/src/client/types';

import { Form, Input, message } from 'antd';
import { Transaction } from '@roochnetwork/rooch-sdk';
import React, { useMemo, useState, useEffect } from 'react';
import {
  useRoochClient,
  useCurrentWallet,
  useCurrentAddress,
  useRoochClientQuery,
  // useSignAndExecuteTransaction,
} from '@roochnetwork/rooch-sdk-kit';

// import { useTheme } from '@mui/material/styles';
import { Stack, Button, useColorScheme } from '@mui/material';

import { processValue, parseParamType } from './utils/param-parser';

export const ModuleView = ({ moduleId, moduleName }: { moduleId: string; moduleName?: string }) => {
  const { mode } = useColorScheme();
  // const theme = useTheme();
  const isDark = mode === 'dark';
  const { data: module } = useRoochClientQuery(
    'getModuleAbi',
    {
      moduleAddr: moduleId,
      moduleName: moduleName || '',
    },
    {
      enabled: !!moduleName,
    }
  );

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

const ModuleDetail = ({
  moduleDetail,
  isDark,
}: {
  moduleDetail: ModuleABIView;
  isDark: boolean;
}) => {
  const [currentFunc, setCurrentFunc] = useState<string>();
  const funcMap = useMemo(
    () => convertToFunctionDetailMap(moduleDetail?.functions),
    [moduleDetail]
  );

  return (
    <div className="container mx-auto flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/3 lg:w-1/4">
        <div className="sticky top-4">
          <div
            style={{
              fontSize: '1.125rem',
              fontWeight: 600,
              marginBottom: '1rem',
              color: isDark ? '#e5e7eb' : 'inherit',
            }}
          >
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
                background:
                  currentFunc === item.name
                    ? isDark
                      ? '#2d3949'
                      : '#e5e7eb'
                    : isDark
                      ? '#1a1f2e'
                      : '#f9fafb',
                color:
                  currentFunc === item.name
                    ? isDark
                      ? '#e5e7eb'
                      : '#111827'
                    : isDark
                      ? '#d1d5db'
                      : 'inherit',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  currentFunc === item.name
                    ? isDark
                      ? '#242b3d'
                      : '#d1d5db'
                    : isDark
                      ? '#242b3d'
                      : '#f3f4f6';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  currentFunc === item.name
                    ? isDark
                      ? '#2d3949'
                      : '#e5e7eb'
                    : isDark
                      ? '#1a1f2e'
                      : '#f9fafb';
              }}
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full md:w-2/3 lg:w-3/4 min-h-[300px]">
        {currentFunc ? (
          <MethodCall
            func={funcMap.get(currentFunc)!}
            moduleDetail={moduleDetail}
            isDark={isDark}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: isDark ? '#9ca3af' : '#6b7280',
            }}
          >
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
  isDark,
}: {
  moduleDetail: ModuleABIView;
  func: FunctionDetail;
  isDark: boolean;
}) => {
  // const sessionKey = useCurrentSession();
  const address = useCurrentAddress();
  // const { mutateAsync: createSessionKey } = useCreateSessionKey();
  const [form] = Form.useForm();
  const [formInput] = Form.useForm();
  const [loading, setLoading] = useState(false);
  // const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction()
  const client = useRoochClient();
  const { wallet } = useCurrentWallet();
  // eslint-disable-next-line consistent-return
  const handleSubmit = async () => {
    try {
      if (loading) return undefined;

      setLoading(true);

      const params = form.getFieldsValue();
      const paramsArr = Object.keys(params).map((key) => {
        const value = params[key];
        const paramType = parseParamType(key);
        return processValue(value, paramType);
      });

      const typeParams = Object.values(formInput.getFieldsValue()) as any[];

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
            const formattedValues = result.return_values.map((item) => {
              if (item.decoded_value !== undefined && item.decoded_value !== null) {
                return typeof item.decoded_value === 'object'
                  ? JSON.stringify(item.decoded_value)
                  : item.decoded_value;
              }
              return formatReturnValue(item.value.value, item.value.type_tag);
            });

            const displayValue =
              formattedValues.length === 1 ? formattedValues[0] : formattedValues;

            message.success({
              content: (
                <div>
                  <div style={{ fontWeight: 500 }}>Operation executed successfully</div>
                  <div
                    style={{
                      color: '#666',
                      fontSize: '0.9em',
                      wordBreak: 'break-all',
                      textAlign: 'left',
                    }}
                  >
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
          if ('MoveAbort' in result.vm_status) {
            const errorCode = result.vm_status.MoveAbort.abort_code;
            message.error(`Operation failed with code: ${errorCode}`);
          } else if ('Error' in result.vm_status) {
            const errorCode = result.vm_status.Error;
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
    formInput.resetFields();
  }, [form, formInput, func]);

  return (
    <div
      style={{
        background: isDark ? '#1a1f2e' : '#ffffff',
        borderRadius: '0.5rem',
        padding: '1.5rem',
      }}
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <h3
          style={{
            fontSize: '1.25rem',
            fontWeight: 600,
            marginBottom: '0.5rem',
            color: isDark ? '#e5e7eb' : 'inherit',
          }}
        >
          {func.name}
        </h3>
        <div
          style={{
            fontSize: '0.875rem',
            color: isDark ? '#9ca3af' : '#6b7280',
          }}
        >
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
                  label={
                    <div
                      style={{
                        overflowX: 'scroll',
                        color: isDark ? '#d1d5db' : 'inherit',
                        fontWeight: 500,
                      }}
                    >
                      {item}
                    </div>
                  }
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

        <Form form={formInput} layout="vertical" className="w-full lg:w-1/2">
          <div className="space-y-4">
            {func?.type_params.map((item, index) => (
              <Form.Item
                key={`type-param-${index}`}
                name={index}
                label={
                  <div
                    style={{ color: isDark ? '#d1d5db' : 'inherit', fontWeight: 500 }}
                  >{`Type Argument ${index + 1}`}</div>
                }
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
            color: loading ? (isDark ? '#9ca3af' : '#6b7280') : isDark ? '#e5e7eb' : '#111827',
            '&:hover': {
              bgcolor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
              boxShadow: 'none',
            },
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
