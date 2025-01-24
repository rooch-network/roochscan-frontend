import type { FunctionDetail } from '@/types';
import type { ModuleABIView } from '@roochnetwork/rooch-sdk/src/client/types';

import './module-view.css';
import useStore from '@/store';
import { Form, Input, message } from 'antd';
import { Iconify } from '@/components/iconify';
import React, { useMemo, useState, useEffect } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneDark, duotoneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { Args, RoochClient, Transaction, normalizeTypeArgsToStr } from '@roochnetwork/rooch-sdk';
import {
  useCurrentAddress,
  useCurrentSession,
  useCreateSessionKey,
  useRoochClientQuery,
} from '@roochnetwork/rooch-sdk-kit';

import {
  Stack,
  Button,
  useColorScheme,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

export const ModuleView = ({ 
  moduleId, 
  moduleName,
}: { 
  moduleId: string;
  moduleName?: string;
}) => {
  const { mode } = useColorScheme();
  const theme = useTheme();
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
  const sessionKey = useCurrentSession();
  const address = useCurrentAddress();
  const { mutateAsync: createSessionKey } = useCreateSessionKey();
  const [form] = Form.useForm();
  const [form1] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      if (!address) return await message.info('Please connect wallet!');
      if (loading) return undefined;
      
      setLoading(true);

      if (!sessionKey) {
        try {
          await createSessionKey({
            appName: 'rooch',
            appUrl: window.location.href,
            scopes: ['0x1::*::*', '0x3::*::*', `${moduleDetail.address}::*::*`],
            maxInactiveInterval: 60 * 60 * 8,
          });
        } catch (e: any) {
          setLoading(false);
          return await message.error(e.message || 'Failed to create session key');
        }
      }

      const params = form.getFieldsValue();
      const paramsArr = Object.keys(params).map(key => {
        const value = params[key];
        return getTypeConvert(key, value);
      });
      const typeParams = Object.values(form1.getFieldsValue()) as any[];

      const txn = new Transaction();
      txn.callFunction({
        address: moduleDetail.address,
        module: moduleDetail.name,
        function: func.name,
        args: [...paramsArr],
        typeArgs: [
          ...typeParams.map((item) =>
            normalizeTypeArgsToStr({
              target: item,
            })
          ),
        ],
      });
      const client = new RoochClient({ url: useStore.getState().roochNodeUrl });
      const result = await client.signAndExecuteTransaction({
        transaction: txn,
        signer: sessionKey as any,
      });

      if (result.execution_info.status.type === 'executed') {
        message.success(`Executed:${result.execution_info.tx_hash}`);
        setLoading(false);
      }
      return undefined;
    } catch (e: any) {
      console.log(e, 'Error');
      setLoading(false);
      message.error(e.message);
      return undefined;
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
                  key={item}
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
                key={item.constraints[1]}
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
  if (typeName.includes('string')) {
    return Args.string(value);
  }
  if (typeName.includes('object')) {
    return Args.objectId(value);
  }
  if (typeName.includes('u8')) {
    return Args.u8(Number(value));
  }
  if (typeName.includes('u16')) {
    return Args.u16(Number(value));
  }
  if (typeName.includes('u32')) {
    return Args.u32(Number(value));
  }
  if (typeName.includes('u64')) {
    return Args.u64(BigInt(value));
  }
  if (typeName.includes('u128')) {
    return Args.u128(BigInt(value));
  }
  if (typeName.includes('u256')) {
    return Args.u256(BigInt(value));
  }
  if (typeName.includes('bool')) {
    return Args.bool(Boolean(value));
  }
  if (typeName.includes('address')) {
    return Args.address(value);
  }
  if (typeName.includes('struct')) {
    return Args.struct(value);
  }
  return Args.address(value);
}; 