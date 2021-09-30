const networkIds = {
  eth: 1,
  bsc: 56,
  polygon: 137
}


const rpc: { [x: number] : { [x: number] : string} } = {
  1: {
    1: 'https://cloudflare-eth.com/'
  },
  56: {
    56: 'https://bsc-dataseed.binance.org/'
  },
  137: {
    137: 'https://polygon-rpc.com/'
  }
  
}

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  networkIds,
  rpc
}
