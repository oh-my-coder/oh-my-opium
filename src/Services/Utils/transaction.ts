import { PromiEvent, TransactionReceipt } from 'web3-core/types'
import axios from 'axios'

import { graphEndpoint } from './constants'

export const sendTx = (
  transactionReceipt: PromiEvent<TransactionReceipt>,
  onConfirm: () => void,
  onError: (error: Error) => void
): Promise<string> => new Promise((resolve, reject) => {
  let done = false
  try {
    transactionReceipt.once('error', e => {if (done) {onError(e)} else {
      onError(e)
      reject(e)
    }})
    transactionReceipt.once('confirmation', (confirmationNumber, receipt) => {if (receipt.status) {onConfirm()}})
    transactionReceipt.once('transactionHash', txHash => {done = true; resolve(txHash)})
  } catch (e) {
    reject(e)
  }
})

export const getScanLink = (address: string, networkId: number) => {
  if (networkId === 1) return `https://etherscan.io/address/${address}`
  if (networkId === 56 ) return `https://bscscan.com/address/${address}`
  if (networkId === 137 ) return `https://polygonscan.com/address/${address}`
}



export const fetchTheGraph = async (subgraphId: string, query: string) => {
  const res: {data: any} = await axios({
    url: `${graphEndpoint}/${subgraphId}`,
    method: 'POST',
    data: {
      query
    },
  })
  return res.data.data
}