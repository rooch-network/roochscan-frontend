export type Address = `0x${string}`;

export enum ThemeColor {
    Light,
    Dark
}
export enum BlockType {
    Block,
    Transaction
}

export interface IContext {
    themeColor: ThemeColor,
    handleSetThemeColor: (val: ThemeColor) => void;
}

export interface Block {
    id: Address,
    height: number,
    da_height: number,
    application_hash: Address,
    output_messages_root_hash: Address,
    transactions_root: Address,
    prev_root: Address,
    coinbase: string,
    coinbase_hash: Address,
    coinbase_amount: string,
    timestamp: number,
    count: number
}


export interface Transaction {
    id: Address,
    height: number,
    block_hash: Address,
    tx_type: String,
    da_height: number,
    gas_limit: string,
    gas_price: string,
    timestamp: number,
    sender: string,
    status: string,
    reason: any,
    input: Input[],
    output: Output[]
}
export interface Contract {
    utxo_id: {
        tx_id: string
        output_index: number
    },
    balance_root: string,
    state_root: string,
    tx_pointer: {
        block_height: Number,
        tx_index: Number
    }
    contract_id: string
}

export interface CoinSigned {
    amount: number
    asset_id: string
    maturity: number
    owner: string
    tx_pointer: { block_height: number, tx_index: number }
    utxo_id: { tx_id: string, output_index: number }
    witness_index: number
}

export interface Variable {
    amount: number
    asset_id: string
    to: string
}

export interface Input {
    Contract: Contract,
    CoinSigned: CoinSigned,
}

export interface Output {
    Contract: Contract,
    CoinSigned: CoinSigned,
    Variable: Variable
}

export interface BlockDetail extends Block {
    transactions: Transaction[]
}

export interface IResponse<T> {
    id: number,
    jsonrpc: string,
    result: T
}

export interface IExecutionInfo {
    event_root: string,
    gas_used: string,
    state_root: string,
    status: { type: string },
    tx_hash: string
}
export interface IData {
    bitcoin_block_hash: string,
    bitcoin_txid: string,
    block_hash: string,
    chain_id: string,
    txid: string,
    type: string,
    sender:string,
    action_type:string,
    action:{
    function_call:{
        function_id:string
    }
    }
    
}
export interface ISequenceInfo {
    tx_accumulator_root: string,
    tx_order: string,
    tx_order_signature: string,
    tx_timestamp: string
}

export interface ITransaction {
    data: IData
    sequence_info: ISequenceInfo
}

export interface ITransactionsByOrderResponse {
    execution_info: IExecutionInfo,
    transaction: ITransaction,
}

export interface IPersonAssets {
    balance
    :
    string
    coin_type
    :
    string
    decimals
    :
    number
    name
    :
    string
    supply
    :
    number
    symbol
    :
    string
}