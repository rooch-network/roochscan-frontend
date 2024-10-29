import {FunctionDetail, IModule} from "@/types";
import {Button, Form, Input, message} from "antd";
import {useCreateSessionKey, useCurrentSession} from "@roochnetwork/rooch-sdk-kit";
import {useState} from "react";


const MethodCall = ({moduleDetail, func}:{
  moduleDetail:IModule,
  func:FunctionDetail
}) =>{
  const sessionKey = useCurrentSession()
  const { mutateAsync: createSessionKey } = useCreateSessionKey();
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () =>{
    try{
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
            ],
            maxInactiveInterval: 60 * 60 * 8,
          })
        } catch (e){
          setLoading(false)
          message.error(e.message)
        }
      }

      const values = form.getFieldsValue();
      const f = `${moduleDetail.address + "::" + moduleDetail.name}::${func.name}`
      console.log(f, "fff")
      console.log(sessionKey, "sessionKey")
      sessionKey?.sendTransaction(f, [], [], { maxGasAmount: 1000000 }).finally(() => {
        setLoading(false)
      })
    } catch (e){
      setLoading(false)
      message.error(e.message)
    }
  }

  return <Form
    form={form}
    className={"w-[700px]"}>

    {
      func.params.map(item =>{
        return  <Form.Item
          key={item}
          name={item}
          label={item}
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Input placeholder={item} key={item}></Input>
        </Form.Item>
      })
    }

    <div className={"flex justify-end"}>
      <Button loading={loading} onClick={handleSubmit} type={"primary"}>Submit</Button>
    </div>
  </Form>
}

export default MethodCall;
