import {Modal} from "antd";
import {useWallets} from "@roochnetwork/rooch-sdk-kit";
import WalletButton from "@/components/WalletButton";


interface Props{
  open:boolean;
  onCancel:()=>void;
}

const WalletConnectModal = ({ open, onCancel }:Props) =>{
  const wallets = useWallets();

  return <Modal width={400} footer={null} onCancel={onCancel} open={open}>
    <div className={"p-[20px]"}>
      <div className={"font-bold text-lg mb-[20px]"}>Connect wallet</div>
      {
        wallets.map(item=>{
          return <WalletButton key={item.getName()} wallet={item} onSelect={onCancel}></WalletButton>
        })
      }
    </div>
  </Modal>
}

export default WalletConnectModal;
