'use client'
import {
  useCreateSessionKey,
  useCurrentAddress,
  useCurrentSession,
  useRoochClientQuery
} from "@roochnetwork/rooch-sdk-kit";
import {ModuleABIView} from "@roochnetwork/rooch-sdk/src/client/types";
import {useEffect, useMemo, useState} from "react";
import {FunctionDetail, IModule} from "@/types";
import {Button, Card, CardContent, CardHeader, Divider, Stack, Tab, Tabs, useColorScheme} from "@mui/material";
import {Prism as SyntaxHighlighter} from "react-syntax-highlighter";
import {duotoneDark, duotoneLight} from "react-syntax-highlighter/dist/esm/styles/prism";
import {Iconify} from "@/components/iconify";
import {DashboardContent} from "@/layouts/dashboard";
import {useRouter} from "@/routes/hooks";
import {useTabs} from "@/hooks/use-tabs";
import {Args, normalizeTypeArgsToStr, RoochClient, Transaction} from "@roochnetwork/rooch-sdk";
import {Form, Input, message} from "antd";
import useStore from "@/store";

const TX_VIEW_TABS = [
  { label: 'Overview', value: 'overview' },
  { label: 'Raw JSON', value: 'raw' },
];
const ModulePage = ({ params }: { params: { id: string }}) =>{
  const id = decodeURIComponent(params.id);
  const tabs = useTabs('overview');
  const [moduleId, moduleName] = id.split("::");
  const router = useRouter();
  const { mode } = useColorScheme();
  const {data:module} = useRoochClientQuery("getModuleAbi", {
    moduleAddr:moduleId,
    moduleName:moduleName,
  })


  const moduleDetail:IModule = useMemo(() => module as IModule, [module]);


  const renderTabs = (
    <Tabs value={tabs.value} onChange={tabs.onChange} sx={{ mb: { xs: 2, md: 2 } }}>
      {TX_VIEW_TABS.map((tab) => (
        <Tab key={tab.value} value={tab.value} label={tab.label} />
      ))}
    </Tabs>
  );

  return  <DashboardContent maxWidth="xl">
    <Button
      className="w-fit"
      onClick={() => {
        router.back();
      }}
      startIcon={<Iconify icon="eva:arrow-ios-back-fill" width={16} />}
    >
      Back
    </Button>

    <Card className="mt-4">
      <CardHeader title="Module" subheader={id} sx={{ mb: 3 }} />
      <Divider />
      <CardContent className="!pt-0">
        {
          renderTabs
        }

        {
          tabs.value === "overview" && (
            <Stack>
              <ModuleDetail moduleDetail={moduleDetail}></ModuleDetail>
            </Stack>
          )
        }

        {tabs.value === 'raw' && (
          <Stack>
            <SyntaxHighlighter
              language="json"
              style={mode === 'light' ? duotoneLight : duotoneDark}
              customStyle={{
                whiteSpace: 'pre-wrap',
                width: '100%',
                borderRadius: '8px',
                wordBreak: 'break-all',
                overflowWrap: 'break-word',
              }}
              wrapLines
              wrapLongLines
            >
              {JSON.stringify(moduleDetail, null, 2)}
            </SyntaxHighlighter>
          </Stack>
        )}
      </CardContent>
    </Card>
  </DashboardContent>

}


const ModuleDetail = ({moduleDetail}:{
  moduleDetail:IModule
}) =>{
  const [currentFunc, setCurrentFunc] = useState<string>();
  const funcMap = useMemo(()=>convertToFunctionDetailMap(moduleDetail?.functions), [moduleDetail])
  return  <div className="container mx-auto flex">
    <div>
      {
        moduleDetail?.functions.map(item=>{
          return <div key={item.name} onClick={()=>setCurrentFunc(item.name)} className={"px-[15px]  dark:bg-[#1d293a] dark:text-white cursor-pointer py-4 bg-[#66666610] my-4 rounded text-[16px] hover:bg-[#66666620]"}>{item.name}</div>
        })
      }
    </div>
    <div className={"flex ml-[20px] p-[20px]"}>
      {
        currentFunc && <MethodCall func={funcMap.get(currentFunc)!}  moduleDetail={moduleDetail}></MethodCall>
      }
    </div>
  </div>
}


const MethodCall = ({moduleDetail, func}:{
  moduleDetail:IModule,
  func:FunctionDetail
}) => {
  const sessionKey = useCurrentSession()
  const address = useCurrentAddress()
  const {mutateAsync: createSessionKey} = useCreateSessionKey();
  const [form] = Form.useForm()
  const [form1] = Form.useForm()
  const [loading, setLoading] = useState(false);

  const handleSubmit = async ():Promise<any> =>{
    try{
      if(!address) return message.info("Please connect wallet!")
      if (loading) {
        return
      }
      setLoading(true)

      if(!sessionKey){
        try{
          await createSessionKey({
            appName: 'rooch',
            appUrl: window.location.href,
            scopes: [
              '0x1::*::*',
              '0x3::*::*',
              `${moduleDetail.address}::*::*`
            ],
            maxInactiveInterval: 60 * 60 * 8,
          })
        } catch (e:any){
          setLoading(false)
          message.error(e.message)
        }
      }

      const params = form.getFieldsValue();
      const paramsArr = []
      for (const key in params) {
        if (params.hasOwnProperty(key)) {
          const value = params[key];
          console.log(key, value)
          const a = getTypeConvert(key, value)
          paramsArr.push(a);
        }
      }
      const typeParams = Object.values(form1.getFieldsValue());

      const txn = new Transaction();
      txn.callFunction({
        address: moduleDetail.address,
        module: moduleDetail.name,
        function: func.name,
        args: [
          // con red envelope object
          // ...params.map(item=>Args.objectId(item))
          ...paramsArr
        ],
        typeArgs: [
          // ...typeParams,
          ...typeParams.map(item=>normalizeTypeArgsToStr({
            target:item,
          })),
        ],
      });
      const client = new RoochClient({url:useStore.getState().roochNodeUrl});
      const result = await client.signAndExecuteTransaction({
        transaction: txn,
        signer: sessionKey as any,
      })


      if(result.execution_info.status.type === 'executed'){
        message.success(`Executed:${result.execution_info.tx_hash}`)
        setLoading(false)
      }
    } catch (e:any){
      console.log(e, "Error")
      setLoading(false)
      message.error(e.message)
    }
  }

  useEffect(()=>{
    form.resetFields();
    form1.resetFields();
  }, [func])

  return <div>
    <div className={"flex"}>
      <Form
        form={form}
        layout="vertical"
        className={"w-[400px]"}>
        <div>
          {
            func?.params.filter(item=>item !== "&signer").map((item, index) =>{
              return  <Form.Item
                key={item}
                name={`${item}${index}`}
                label={<div className="dark:text-white">{item}</div>}
                rules={[
                  {
                    required: true,
                  },
                ]}
              >
                <Input placeholder={item} className="dark:text-white dark:bg-dark-gray" key={item}></Input>
              </Form.Item>
            })
          }
        </div>
      </Form>
      <Form
        form={form1}
        layout="vertical"
        className={"w-[400px] ml-20"}>
        {
          func?.type_params.map((item, index) =>{
            return  <Form.Item
              key={item.constraints[1]}
              name={index}
              label={<div className="dark:text-white">{`Ty${index}`}</div>}
              rules={[
                {
                  required: true,
                },
              ]}
            >
              <Input placeholder={item.constraints[1]} className="dark:text-white dark:bg-dark-gray"  key={item.constraints[1]}></Input>
            </Form.Item>
          })
        }
      </Form>
    </div>
    <div className={"flex justify-end"}>
      <Button className={"!bg-[#000] !text-white"} loading={loading} onClick={handleSubmit} type={"primary"}>Execute</Button>
    </div>
  </div>
}



function convertToFunctionDetailMap(functions?: FunctionDetail[]): Map<string, FunctionDetail> {
  if(!functions){
    return new Map<string, FunctionDetail>();
  }
  const functionDetailMap = new Map<string, FunctionDetail>();
  functions!.forEach((func) => {
    functionDetailMap.set(func.name, func);
  });
  return functionDetailMap;
}


const getTypeConvert = (typeName:string, value:any) =>{

  if(typeName.includes("string")){
    return Args.string(value);
  }

  if(typeName.includes("object")){
    return Args.objectId(value)
  }

  if(typeName.includes("u8")){
    return Args.u8(Number(value))
  }

  if(typeName.includes("u16")){
    return Args.u16(Number(value))
  }

  if(typeName.includes("u32")){
    return Args.u32(Number(value))
  }

  if(typeName.includes("u64")){
    return Args.u64(BigInt(value))
  }

  if(typeName.includes("u128")){
    return Args.u128(BigInt(value))
  }

  if(typeName.includes("u256")){
    return Args.u256(BigInt(value))
  }

  if(typeName.includes("bool")){
    return Args.bool(Boolean(value))
  }

  if(typeName.includes("address")){
    return Args.address(value)
  }

  if(typeName.includes("struct")){
    return Args.struct(value)
  }
  // if(typeName.includes("vec")){
  //   return Args.vec(getTypeConvert(typeName, value))
  // }

  return Args.address(value)
}


export default ModulePage
