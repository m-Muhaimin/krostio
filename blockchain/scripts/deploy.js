const hre = require("hardhat");

async function main() {
  const IncomeAttestation = await hre.ethers.getContractFactory("IncomeAttestation");
  const contract = await IncomeAttestation.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("IncomeAttestation deployed to:", address);

  // Verify on block explorer
  if (hre.network.name !== "hardhat") {
    console.log("Waiting for confirmations...");
    await contract.deploymentTransaction().wait(5);
    await hre.run("verify:verify", { address, constructorArguments: [] });
    console.log("Contract verified on block explorer");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
