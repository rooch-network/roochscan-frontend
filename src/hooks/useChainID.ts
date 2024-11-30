import { queyChainID } from "@/api"
import useSWR from "swr"
import useStore from "@/store"

export default function useChainID() {
    const { roochNodeUrl } = useStore()
    const { data } = useSWR(roochNodeUrl, queyChainID)
    return data?.result || "0"
}