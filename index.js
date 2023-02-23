const Moralis = require("moralis").default;
const { EvmChain } = require("@moralisweb3/common-evm-utils");
const { ethers } = require("ethers");

const Moralis_API_KEY = "t7FBZVuDsMwa1imBMJYfFGeWK5v7jHZnvatChGxqjHZY70WJdRlW4QmnxtakxORJ";
const NFT_COLLECTION_ADDRESS = "0x364C828eE171616a39897688A831c2499aD972ec";

function delay(time) {
    return new Promise(resolve => setTimeout(resolve, time * 1000));
}

const runApp = async () => {
    await Moralis.start({
        apiKey: Moralis_API_KEY
    });
    
    const rpcURL = 'https://eth-mainnet.g.alchemy.com/v2/ncXC0ov2jncquAVGhYFfxir33qx1PFEL';
    const provider = new ethers.JsonRpcProvider(rpcURL);
    const chain = EvmChain.ETHEREUM;
    
    let blockNumberOrHash = 0;
    let fail = false;
    while(true) {
        try{
            const highestblock = await provider.getBlock('latest');
            
            if(blockNumberOrHash < highestblock['number'] || fail) {
                blockNumberOrHash = highestblock['number'];
                console.log("Block Number: ", blockNumberOrHash);
                const response = await Moralis.EvmApi.nft.getNFTTransfersByBlock({
                    blockNumberOrHash,
                    chain,
                });
              
                const result = response.toJSON();

                if(result.result?.length > 0) {
                    result.result.map((txInfo) => {
                        if(txInfo?.token_address == NFT_COLLECTION_ADDRESS) {
                            console.log("Token ID: ", txInfo.token_id);
                            console.log("Price: ", ethers.formatEther(txInfo.value));
                            console.log("From: ", txInfo.from_address, " To: ", txInfo.to_address);
                        }
                    })
                }
                fail = false;
            }
            await delay(2);
        } catch(e) {
            fail = true;
            console.log("Morails SDK Error. Try again!");
        }
    }    
}

runApp();