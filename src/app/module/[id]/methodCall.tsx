import {FunctionDetail, IModule} from "@/types";
import {Button, Form, Input, message} from "antd";
import {useCreateSessionKey, useCurrentAddress, useCurrentSession} from "@roochnetwork/rooch-sdk-kit";
import {useEffect, useState} from "react";
import {Args, RoochClient, Transaction, normalizeTypeArgsToStr} from "@roochnetwork/rooch-sdk";
import useStore from "@/store";




const getTypeConvert = (typeName:string, value:string) =>{

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

  if(typeName.includes("vec")){
    return Args.vec(getTypeConvert(typeName, value))
  }
}



const MethodCall = ({moduleDetail, func}:{
  moduleDetail:IModule,
  func:FunctionDetail
}) =>{
  const sessionKey = useCurrentSession()
  const address = useCurrentAddress()
  const { mutateAsync: createSessionKey } = useCreateSessionKey();
  const [form] = Form.useForm()
  const [form1] = Form.useForm()
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () =>{
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
      console.log("执行交易", sessionKey)
      console.log("执行交易", txn)
      const client = new RoochClient({url:useStore.getState().roochNodeUrl});
      console.log("执行交易", client)
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
    <div className={"flex justify-start"}>
      <Button loading={loading} onClick={handleSubmit} type={"primary"}>Submit</Button>
    </div>
  </div>
}

export default MethodCall;
