
export const lastBlockETH = 13327177
export const lastBlockPolygon = 19679830
export const lastBlockBSC = 11364780


export const lastBlockByNetwork: {[x: number] : number} = {
  1: lastBlockETH,
  56: lastBlockBSC,
  137: lastBlockPolygon
}

export const graphEndpoint = 'https://api.thegraph.com/subgraphs/name/opiumprotocol'

export const subgraphs: {[x: number] : string}  = {
  1: 'staking-long-positions-tracker',
  56: 'bsc-ofi-long-pos-track',
  137: 'ofi-long-positions-tracker-matic',
}