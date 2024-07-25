import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { getRoochNodeUrl } from '@roochnetwork/rooch-sdk';
interface StoreState {
    roochNodeUrl: string,
    setRoochNodeUrl: (val: string) => void,
}
const useStore = create(
    persist<StoreState>(
        (set, get) => ({
            roochNodeUrl: getRoochNodeUrl("devnet"),
            setRoochNodeUrl: (val: string) => set({ roochNodeUrl: val }),
        }),
        {
            name: 'roochNodeUrl', // name of the item in the storage (must be unique)
            storage: createJSONStorage(() => localStorage), // (optional) by default, 'localStorage' is used
        },
    ),
)

export default useStore

