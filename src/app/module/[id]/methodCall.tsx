import {FunctionDetail, IModule} from "@/types";
import {Button, Form, Input, message} from "antd";
import {useCreateSessionKey, useCurrentSession} from "@roochnetwork/rooch-sdk-kit";
import {useState} from "react";
import {RoochClient, Transaction} from "@roochnetwork/rooch-sdk";
import useStore from "@/store";


const MethodCall = ({moduleDetail, func}:{
  moduleDetail:IModule,
  func:FunctionDetail
}) =>{
  const sessionKey = useCurrentSession()
  const { mutateAsync: createSessionKey } = useCreateSessionKey();
  const [form] = Form.useForm()
  const [form1] = Form.useForm()
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
        } catch (e:any){
          setLoading(false)
          message.error(e.message)
        }
      }

      const params = Object.values(form.getFieldsValue());
      const typeParams = Object.values(form1.getFieldsValue());

      console.log(params, typeParams)

      const tx = new Transaction();
      const f = `${moduleDetail.address + "::" + moduleDetail.name}::${func.name}`
      tx.callFunction({
        target: f,
        args: [...params]as any,
      })
      const client = new RoochClient({url:useStore.getState().roochNodeUrl});
      const result = await client.signAndExecuteTransaction({
        transaction: tx,
        signer: sessionKey as any,
      })

      if(result.execution_info.status.type === 'executed'){
        message.success("Executed")
      }
    } catch (e:any){
      console.log(e, "Error")
      setLoading(false)
      message.error(e.message)
    }
  }

  return <div>
    <div className={"flex"}>
      <Form
        form={form}
        className={"w-[400px]"}>
        <div>
          {
            func.params.map(item =>{
              return  <Form.Item
                key={item}
                name={item}
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
        className={"w-[400px]"}>
        <div className={"flex justify-end"}>
          <div>
            {
              func.type_params[0].constraints.map(item =>{
                return  <Form.Item
                  key={item}
                  name={item}
                  label={<div className="dark:text-white">{item}</div>}
                  rules={[
                    {
                      required: true,
                    },
                  ]}
                >
                  <Input placeholder={item} className="dark:text-white dark:bg-dark-gray"  key={item}></Input>
                </Form.Item>
              })
            }
          </div>
        </div>
      </Form>
    </div>
    <div className={"flex justify-center"}>
      <Button loading={loading} onClick={handleSubmit} type={"primary"}>Submit</Button>
    </div>
  </div>
}

export default MethodCall;
