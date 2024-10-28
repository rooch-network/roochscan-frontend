import {FunctionDetail, IModule} from "@/types";
import {useMemo, useState} from "react";
import {Button, Form, Input} from "antd";


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

const ModuleDetail = ({moduleDetail}:{
  moduleDetail:IModule
}) =>{
  const [currentFunc, setCurrentFunc] = useState<string>();
  const funcMap = useMemo(()=>{
    return convertToFunctionDetailMap(moduleDetail?.functions)
  }, [moduleDetail])


  return  <div className="container mx-auto flex">
    <div>
      {
        moduleDetail?.functions.map(item=>{
          return <div key={item.name} onClick={()=>setCurrentFunc(item.name)} className={"px-[15px] cursor-pointer py-10 bg-[#66666610] my-10 rounded text-[16px] hover:bg-[#66666620]"}>{item.name}</div>
        })
      }
    </div>
    <div className={"flex ml-[20px]"}>
      {
        currentFunc && <Form className={"w-[700px]"}>
          {
            funcMap.get(currentFunc)?.params.map(item=>{
              return (
                <Form.Item
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
              )
            })
          }

          <div className={"flex justify-end"}>
            <Button type={"primary"}>Submit</Button>
          </div>
        </Form>
      }
    </div>
  </div>
}

export default ModuleDetail;
