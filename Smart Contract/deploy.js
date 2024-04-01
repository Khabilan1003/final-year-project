const ethers = require("ethers");
const fs = require("fs");

// Environment Variable
// Bad Practice. Use .env file
ETH_SEPHOLIA_PROVIDER =
  "https://eth-sepolia.g.alchemy.com/v2/wcM0ZO82dLv-qoTuY8Qgqh_cxcuBSWuc";

// Function to check whether it is possible to deploy it
async function main() {
  const provider = new ethers.JsonRpcProvider(ETH_SEPHOLIA_PROVIDER);
  const wallet = new ethers.Wallet(
    "e6770783bebf72781293fd34ddda458a53da38ee549174d5e5a245eb5089e028",
    provider
  );

  const abi = fs.readFileSync(
    "Royalty_multiuser_variable_month_sol_RoyaltyTokenWithMultipleOwners.abi",
    "utf-8"
  );
  const bin = fs.readFileSync(
    "Royalty_multiuser_variable_month_sol_RoyaltyTokenWithMultipleOwners.bin",
    "utf-8"
  );

  const contractFactory = new ethers.ContractFactory(abi, bin, wallet);
  const contract = await contractFactory.deploy("Title1", [
    "0x68B635ED7eB00071F8F720d026742786FDCe6431",
  ]);
  const address = await contract.getAddress();

  console.log(address);
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.log(e.message);
    process.exit(1);
  });
