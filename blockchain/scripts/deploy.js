import hre from "hardhat";

async function main() {
  const CleanLedger = await hre.ethers.getContractFactory("CleanLedger");
  console.log("Deploying CleanLedger...");
  const cleanLedger = await CleanLedger.deploy();

  await cleanLedger.waitForDeployment();

  console.log("CleanLedger deployed to:", await cleanLedger.getAddress());
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
