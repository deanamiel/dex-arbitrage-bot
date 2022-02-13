const uniswapMainnet = require("./uniswap.json");
const tokensMainnet = require("./tokens.json");
const sushiswapMainnet = require("./sushiswap.json");
const uniswapv3Mainnet = require("./uniswapv3.json");

module.exports = {
  mainnet: {
    uniswap: uniswapMainnet,
    tokens: tokensMainnet,
    sushiswap: sushiswapMainnet,
    uniswapv3: uniswapv3Mainnet
  },
};
