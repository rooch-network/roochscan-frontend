import {FunctionDetail, IModule} from "@/types";
import {useState} from "react";


function convertToFunctionDetailMap(functions: FunctionDetail[]): Map<string, FunctionDetail> {
  const functionDetailMap = new Map<string, FunctionDetail>();
  functions.forEach((func) => {
    functionDetailMap.set(func.name, func);
  });
  return functionDetailMap;
}

const ModuleDetail = ({moduleDetail}:{
  moduleDetail:IModule
}) =>{

  const funcMap = convertToFunctionDetailMap(moduleDetail.functions)
  const [currentFunc, setCurrentFunc] = useState();

  return  <div className="container mx-auto flex">
    <div>
      {
        moduleDetail.functions.map(item=>{
          return <div onClick={()=>setCurrentFunc(item.name)} className={"px-[15px] cursor-pointer py-10 bg-[#66666610] my-10 rounded text-[16px] hover:bg-[#66666620]"}>{item.name}</div>
        })
      }
    </div>
    <div className={"flex ml-[20px]"}>
      {
        currentFunc && <div>
          {
            funcMap.get(currentFunc).params.map(item=>{
              return <div>{
                item
              }</div>
            })
          }
        </div>
      }
    </div>
  </div>
}

export default ModuleDetail;
