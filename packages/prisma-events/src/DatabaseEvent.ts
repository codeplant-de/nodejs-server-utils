type Tx = {id: string; kind: string}
type TxCallback = (cb: () => void) => void

export type DatabaseEventData = {
  args: object
  result: unknown | undefined
  dataPath: string[]
} & (
  | {
      transaction: Tx
      transactionCallbacks: {
        rollback: TxCallback
        commit: TxCallback
      }
    }
  | {
      transaction: undefined
      transactionCallbacks: undefined
    }
)

class DatabaseEvent {
  private readonly transactionCallbacks: DatabaseEventData['transactionCallbacks']

  private readonly args: DatabaseEventData['args']

  private readonly result: DatabaseEventData['result']

  private readonly transaction: DatabaseEventData['transaction']

  private readonly dataPath: DatabaseEventData['dataPath']

  constructor(eventData: DatabaseEventData) {
    const {args, dataPath, transactionCallbacks, result, transaction} = eventData

    this.transactionCallbacks = transactionCallbacks
    this.args = args
    this.result = result
    this.transaction = transaction
    this.dataPath = dataPath
  }

  getArgs(): object {
    return this.args
  }

  getResult(): unknown | undefined {
    return this.result
  }

  getTransactionId(): string | undefined {
    return this.transaction?.id
  }

  getDataPath(): string[] {
    return this.dataPath
  }

  inTransaction(): boolean {
    return typeof this.transaction !== 'undefined'
  }

  onTransactionCommit(callback: () => void | Promise<void>): void {
    if (!this.inTransaction()) {
      throw new Error('not within a transaction')
    }

    this.transactionCallbacks!.commit(callback)
  }
}

export default DatabaseEvent
