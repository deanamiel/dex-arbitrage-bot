require("dotenv").config();
const Web3 = require("web3");
const fs = require("fs");
const ethers = require("ethers")
const provider = ethers.getDefaultProvider();
const request = require("request");

// var {
//   ChainId,
//   Token,
//   Pair,
//   Route,
//   Trade,
//   TradeType,
//   SUSHISWAP_TWAP_1_ORACLE_ADDRESS,
// } = require("@sushiswap/sdk");
// const ChainIdSushi = ChainId;
// const TokenSushi = Token;
// const TokenAmountSushi = TokenAmount;
// const PairSushi = Pair;
// const FetcherSushi = Fetcher;
// const RouteSushi = Route;
// const TradeSushi = Trade;
// const TradeTypeSushi = TradeType;

// var {
//   Pool
// } = require("@uniswap/v3-sdk");

var {
  ChainId,
  Token,
  TokenAmount,
  Pair,
  Fetcher,
  Route,
  Trade,
  TradeType,
} = require("@uniswap/sdk");
const ChainIdUni = ChainId;
const TokenUni = Token;
const TokenAmountUni = TokenAmount;
const PairUni = Pair;
const FetcherUni = Fetcher;
const RouteUni = Route;
const TradeUni = Trade;
const TradeTypeUni = TradeType;

const { mainnet: addresses } = require("./addresses");

const web3 = new Web3(
  new Web3.providers.WebsocketProvider(process.env.INFURA_URL)
);

const ONE_WEI = web3.utils.toBN(web3.utils.toWei("1"));
const AMOUNT_DAI_WEI = web3.utils.toBN(web3.utils.toWei("1000"));
const INPUT_AMOUNT_DAI = 1000.0;

const init = async () => {
  web3.eth
    .subscribe("newBlockHeaders")
    .on("data", async (block) => {
      console.log(`New block recieved. Block number: ${block.number}`);

      // const [daiSushi, ethSushi] = await Promise.all(
      //   [
      //     addresses.tokens["dai"],
      //     addresses.tokens["eth"],
      //   ].map((tokenAddress) =>
      //     new TokenSushi(
      //       ChainIdSushi.MAINNET,
      //       tokenAddress,
      //       10
      //     )
      //   )
      // );

      // console.log(daiSushi);

      // const SushiPair = await PairSushi.getAddress(daiSushi, ethSushi);

      // console.log(SushiPair);

      let amountFromKyber = {};

      function getTradingPair(id, qty) {
        return new Promise((resolve, reject) => {
          const url = "https://api.kyber.network/buy_rate?id=" + id + "&qty=" + qty;
          request({url: url, json: true}, (error, response) => {
            if (response) {
              //console.log("Second - inside second promise");
              amountFromKyber = response.body.data[0].src_qty[0];
              resolve();
            } else {
              reject(error);
            }
            //console.log("Third - leaving second promise");
          })
        })
      }
 
      const url = 'https://api.kyber.network/currencies'

      function getEthDai(url,amount,dai) {
        return new Promise((resolve, reject) => {
          request({url: url, json: true}, async (error, response) => {
            if (response) {
              //console.log("First - inside first promise");
              var id = {};
              if (dai) {
                id = response.body.data[3].id;
              } else {
                id = response.body.data[0].id;
              }
              //console.log("First");
              const val = await getTradingPair(id, amount);
              resolve();
            } else {
              reject(error);
            }
            //console.log("Fourth - leaving first promise");
          })
        })
      }
 
      await getEthDai(url, INPUT_AMOUNT_DAI, true);
      const ethFromKyber = amountFromKyber;

      const [daiUni, ethUni] = await Promise.all(
        [
          addresses.tokens["dai"],
          addresses.tokens["eth"],
        ].map((tokenAddress) =>
          FetcherUni.fetchTokenData(
            ChainIdUni.MAINNET,
            tokenAddress
          )
        )
      );

      const UniPair = await FetcherUni.fetchPairData(
        ethUni,
        daiUni
      );

      // console.log(UniPair);

      // const DAI_TO_ETH_SUSHI = new RouteSushi([SushiPair], daiSushi);
      // const tradeSushi = new TradeSushi(
      //   DAI_TO_ETH_SUSHI,
      //   new TokenAmountSushi(daiSushi, BigInt(11)),
      //   TradeTypeSushi.EXACT_INPUT
      // );

      // // const ethFromSushi =
      // //   tradeSushi.executionPrice.toSignificant(6) * INPUT_AMOUNT_DAI;


      const DAI_TO_ETH_Uni = new RouteUni([UniPair], daiUni);
      const tradeUni = new TradeUni(
        DAI_TO_ETH_Uni,
        new TokenAmountUni(daiUni, "1000000000000000"),
        TradeTypeUni.EXACT_INPUT
      );

      const ethFromUni =
        tradeUni.executionPrice.toSignificant(6) * INPUT_AMOUNT_DAI;

      const daiFromKyber = ethFromUni * (1000.0/ethFromKyber);

      // console.log(daiFromKyber);

      // // const SushiPairInverted = await FetcherSushi.fetchPairData(
      // //   daiSushi,
      // //   ethSushi
      // // );

      // // const ETH_TO_DAI_SUSHI = new RouteSushi(
      // //   [SushiPairInverted],
      // //   ethSushi
      // // );
      // // const tradeSushiInverted = new TradeSushi(
      // //   ETH_TO_DAI_SUSHI,
      // //   new TokenAmountSushi(ethSushi, BigInt(1e18)),
      // //   TradeTypeSushi.EXACT_INPUT
      // // );

      // // const DAIFromSushi =
      // //   tradeSushiInverted.executionPrice.toSignificant(6) * ethFromUni;

      const UniPairInverted = await FetcherUni.fetchPairData(
        daiUni,
        ethUni
      );

      const ETH_TO_DAI_Uni = new RouteUni(
        [UniPairInverted],
        ethUni
      );
      const tradeUniInverted = new TradeUni(
        ETH_TO_DAI_Uni,
        new TokenAmountUni(ethUni, BigInt(1e18)),
        TradeTypeUni.EXACT_INPUT
      );

      const daiFromUni =
        tradeUniInverted.executionPrice.toSignificant(6) * ethFromKyber;

      console.log(`Swap Uniswap --> Kyber 1000 / ${daiFromKyber}`);
      console.log(`Swap Kyber --> Uniswap 1000 / ${daiFromUni}`);

      // if (daiFromSushi > INPUT_AMOUNT_DAI) {
      //   const profit = daiFromSushi - INPUT_AMOUNT_DAI;
      //   console.log(`${profit} -> Buy Uniswap, sell Sushiswap`);
      //   fs.writeFile(
      //     "./profitPolygon.txt",
      //     `${profit} -> Buy Uniswap, sell Sushiswap,\n`,
      //     { flag: "a" },
      //     (err) => {
      //       if (err) {
      //         console.error(err);
      //         return;
      //       }
      //       //file written successfully
      //     }
      //   );
      // } else if (daiFromUni > INPUT_AMOUNT_DAI) {
      //   const profit = daiFromUni - INPUT_AMOUNT_DAI;
      //   console.log(`${profit} -> Buy Sushiswap, sell Uniswap`);
      //   fs.writeFile(
      //     "./profitPolygon.txt",
      //     `${profit} -> Buy Sushiswap, sell Uniswap,\n`,
      //     { flag: "a" },
      //     (err) => {
      //       if (err) {
      //         console.error(err);
      //         return;
      //       }
      //       //file written successfully
      //     }
      //   );
      // }
    })
    .on("error", (error) => {
      console.log(error);
    });
};

init();