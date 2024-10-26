import {timeFormat} from "@/utils";
import React from "react";
import {IObject, ITransactionsByOrderResponse} from "@/types";


const ObjectDetail = ({ object }: { object: IObject }) =>{

   return <div className="container mx-auto ">
    <div className=" rounded-md mt-20 border border-light-gray shadow-md p-20 bg-white">
      <div className="flex item-center border-b border-light-gray pt-15 pb-15">
        <div className="w-1/4">
          Owner
        </div>
        <div>
          {object?.owner}
        </div>
      </div>
      <div className="flex item-center border-b border-light-gray pt-15 pb-15">
        <div className="w-1/4">
          Owner Bitcoin address
        </div>
        <div className=" w-3/4 break-words">
          {object?.owner_bitcoin_address}
        </div>
      </div>
      <div className="flex item-center border-b border-light-gray pt-15 pb-15">
        <div className="w-1/4">
          Object Type
        </div>
        <div>
          {object?.object_type}
        </div>
      </div>
      <div className="flex item-center border-b border-light-gray pt-15 pb-15">
        <div className="w-1/4">
          Size
        </div>
        <div>
          {object?.size}
        </div>
      </div>
      <div className="flex item-center border-b border-light-gray pt-15 pb-15">
        <div className="w-1/4">
          State index
        </div>
        <div>
          {object?.state_index}
        </div>
      </div>

      <div className="flex item-center border-b border-light-gray pt-15 pb-15">
        <div className="w-1/4">
          State root
        </div>
        <div>
          {object?.state_root}
        </div>
      </div>
      <div className="flex item-center border-b border-light-gray pt-15 pb-15">
        <div className="w-1/4">
         Tx order
        </div>
        <div>
          {object?.tx_order}
        </div>
      </div>
      <div className="flex item-center border-b border-light-gray pt-15 pb-15">
        <div className="w-1/4">
          Created Time
        </div>
        <div>
          {timeFormat(Number(object?.created_at))}
        </div>
      </div>
      <div className="flex item-center border-b border-light-gray pt-15 pb-15">
        <div className="w-1/4">
          Updated time
        </div>
        <div>
          {object?.updated_at}
        </div>
      </div>
      <div className="flex item-center border-b border-light-gray pt-15 pb-15">
        <div className="w-1/4">
          Value
        </div>
        <div>
          {object?.value}
        </div>
      </div>
    </div>
  </div>
}

export default ObjectDetail;
