import {useConnectWallet, Wallet} from "@roochnetwork/rooch-sdk-kit";
import {useEffect, useState} from "react";
import {Button, message} from "antd";

const WalletButton = ({wallet, onSelect,}: {
  wallet: Wallet;
  onSelect: () => void;
}) =>{
  const { mutateAsync: connectWallet } = useConnectWallet();

  const [walletInstalled, setWalletInstalled] = useState(false);
  const [checkingInstall, setCheckingInstall] = useState(false);

  useEffect(() => {
    async function checkWalletInstalled() {
      setCheckingInstall(true);
      const installed = await wallet.checkInstalled();
      setWalletInstalled(installed);
      setCheckingInstall(false);
    }
    checkWalletInstalled().then();
  }, [wallet]);

  return <Button
    onClick={async () => {
      try {
        await connectWallet({ wallet });
      } catch (e:any) {
        if (wallet.getName() === 'OneKey' && e.message.includes('Invalid address')) {
          message.error('Please disconnect and re-authorize the taproot address')
        }
      }
      onSelect();
    }}
    disabled={walletInstalled === false || checkingInstall}
    className={"flex items-center w-full h-[65px] px-[15px] justify-between my-[10px] rounded-xl"}>

    <div className={"flex items-center"}>
      <img src={wallet.getIcon()} width="36px" alt="" />
      <div className={"ml-[15px] font-bold text-lg"}>{wallet.getName()}</div>
    </div>
    <div className={"text-[#009000] bg-[#00900060] px-10 rounded"}>
      {
        walletInstalled && "Installed"
      }
    </div>
  </Button>
}

export default WalletButton;
