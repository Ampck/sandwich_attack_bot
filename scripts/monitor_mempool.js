const { ethers } = require("hardhat")
const config = require('../config.json')
require("dotenv").config()

const { getTokenAndContract, getPairContract, getReserves, calculatePrice, simulate } = require('../helpers/helpers')
const IUniswapV2Router02 = require('@uniswap/v2-periphery/build/IUniswapV2Router02.json')
const IUniswapV2Factory = require("@uniswap/v2-core/build/IUniswapV2Factory.json")

async function main() {

	const provider = new ethers.WebSocketProvider(
		`wss://eth-mainnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`
	)

	const uFactory = new ethers.Contract(config.UNISWAP.FACTORY_ADDRESS, IUniswapV2Factory.abi, provider)
	const uRouter = new ethers.Contract(config.UNISWAP.V2_ROUTER_02_ADDRESS, IUniswapV2Router02.abi, provider)

	provider.on('pending', async (tx_hash) => {

		try {
			const tx = await provider.getTransaction(tx_hash);

			if (tx) {
				if (tx.data != null && tx.data != "0x") {
					const tx_method = (tx.data).toString().substring(2, 10)

					if (tx_method == "7ff36ab5") {
						let calldata = []
						
						for (let i = 0; i < ((tx.data.length - 10)/64); i++) {
							let currentData = ""

							for (let a = 0; a < 64; a++) {
								currentData += tx.data.toString().substring(10 + (i * 64) + a, 10 + (i * 64) + a + 1)

							}
							calldata[i] = currentData
						}

						let uPair = await getPairContract(uFactory, ("0x" + calldata[5].toString().substring(24, 64)), ("0x" + calldata[6].toString().substring(24, 64)), provider)
						console.log("\n\n\nTx Hash: " + tx_hash)
						console.log(`uPair Address: ${await uPair.getAddress()}`)
					}

					// after the methodID, each piece of data in tx.data
					// is 32 bytes longs, (64 hex characters),

					/*
					how to do the thingy:

					step 1: find potential sandwich tx
					step 2: find how much to buy
					step 3: determine gas price
					step 4: determine profitability
					step 5: put in buy & sell tx
					step 6: wait for sandwich to complete
					step 7: log data

					*/

					/*
					how to the heck do I know how much to buy????????

					step 1: find the given liquidity pair ab=k values
					step 2: calculate what the token pair would need to equal to
						make the target get ONLY their "amountOutMin" amount of tokens
					
					screw step 2, we're gonna instead just copy their exact amount

					step 3: find out how much to buy, to make the liquidity pool
						equal the amount
					step 4: buy
					step 5: wait for meat tx....
					step 6: sell
					step 7: profit
					step 8: bugatti

					*/

					/*
					how to see if it's profitable?

					step 1: get the amount you will purchase
					step 2: see how much of token you will get if you buy
					step 3: see how much you will get if you sell after the meat tx
					step 4: subtract gas fees from profit

					*/
				}
			}

		} catch (e) {
			console.error(e)
			console.error("Error!")
		}

	})

}
main();