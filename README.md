# DEX Arbitrage Bot
This project contains the implementation of an arbitrage bot that monitors Ether price discrepancies between Uniswap and Kyber. If a discrepancy is detected, the arbitrage
bot will attempt to execute an arbitrage trade, buying Ether on the cheaper exchange and then selling it on the more expensive exchange all in one transaction. The bot
utilizes a dy/dx flashloan to increase trading capital with zero added risk. The code is currently configured for the Ethereum mainnet but can be modified to be used on other 
blockchains such as Binance or Polygon. Additionally, the code can be modified to search for arbitrage opportunities among cryptocurrencies other than Ether. The code for detecting
price discrepancies and initiating the flashloan contract is in arbitrage.js. The flashloan smart contract code is in contracts/flashloan.sol.
