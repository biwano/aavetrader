// Setup: npm install alchemy-sdk
// Github: https://github.com/alchemyplatform/alchemy-sdk-js
import { Network, Alchemy, Utils } from 'alchemy-sdk'

export const getAlchemy = () => {
  if (!process.env.ALCHEMY_KEY) throw 'No alchemy key'
  const settings = {
    apiKey: process.env.ALCHEMY_KEY, // Replace with your Alchemy API Key.
    network: Network.OPT_MAINNET, // Replace with your network.
  }

  return new Alchemy(settings)
}

export const getGasPriceInGwei = async () => {
  const alchemy = getAlchemy()
  const currentGasInHex = await alchemy.core.getGasPrice()
  return Number(Utils.formatUnits(currentGasInHex, 'gwei'))
}
