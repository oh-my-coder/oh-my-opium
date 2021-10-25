export const shortenAddress = (address: string) => {
  const firstSymbols = address.slice(0, 6)
  const lastSymbols = address.slice(address.length-4, address.length)
  const result = `${firstSymbols}...${lastSymbols}`
  return result
}