const ethers = require("ethers");
const fs = require("fs");
const payload = fs.readFileSync("./txs.log", { encoding: "utf8" });
const payloadParsed = payload.split("\n");

const provider = new ethers.providers.InfuraProvider(
  "homestead",
  "PROJECT_ID_HERE"
);

const txListLimit = payloadParsed.length - 1;
let regCounter = 0;
let currentTxToCheck = 1;
let checkLock = false;
setInterval(() => {
  if (checkLock === true && currentTxToCheck >= txListLimit) {
    return;
  }
  checkLock = true;
  const dataPacket = payloadParsed[currentTxToCheck].split(",");
  const txToCheck = dataPacket[0];
  const txType = dataPacket[dataPacket.length - 2];
  if (txType.indexOf("Request") > -1) {
    currentTxToCheck++;
    return;
  }
  provider.getTransactionReceipt(txToCheck).then((r) => {
    const qualifiedLogs = r.logs.filter((l) => {
      return (
        l.topics.includes(
          "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"
        ) === true &&
        l.topics[1] ===
          "0x0000000000000000000000000000000000000000000000000000000000000000"
      );
    });
    regCounter += qualifiedLogs.length;
    console.log("TX #", currentTxToCheck, "Registration Count:", regCounter);
    fs.appendFileSync(
      "txs-result.log",
      "TX #" + currentTxToCheck + " Registration Count: " + regCounter + "\n"
    );
    currentTxToCheck++;
    checkLock === false;
  });
}, 100);
