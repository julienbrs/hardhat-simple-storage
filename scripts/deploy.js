// imports necessary, we import ethers through hardhat
// run package to run any hardhat task
const { ethers, run, network } = require("hardhat");

// async main function to deplay
async function main() {
    /* Hardhat understands that SimpleStorage is already compiled and in contracts/ */
    const SimpleStorageFactory = await ethers.getContractFactory(
        "SimpleStorage"
    );
    console.log("Deploying the contract, please wait...");
    /* By default, hardhat is deploying to local Ethereum hardhat network */
    const SimpleStorage = await SimpleStorageFactory.deploy();
    await SimpleStorage.deployed();
    console.log("Contract adress is: ", SimpleStorage.address);

    // verifying the contract when deploying IF it's a live network
    // console.log("network config = ", network.config);
    if (network.config.chainId === 5 && process.env.ETHERSCAN_API_KEY) {
        // wait a bit so etherscan can see the contract deployed
        console.log("Wait 5 blocks before verifying..");
        await SimpleStorage.deployTransaction.wait(5);
        await verify(SimpleStorage.address, []); // don't forget the await!
    }

    // see current value...
    const currentValue = await SimpleStorage.retrieve();
    console.log("The current value is ", currentValue);

    // and change it:
    const transactionResponse = await SimpleStorage.store(41);
    await transactionResponse.wait(1);
    const updatedValue = await SimpleStorage.retrieve();
    console.log("And now, the value is", updatedValue);
}

// function to verify contract
async function verify(contractAdress, args) {
    console.log("Verifying the contract, please wait...");
    try {
        await run("verify:verify", {
            address: contractAdress,
            constructorArguments: args,
        });
        // if etherscan already verified it automatically
    } catch (e) {
        if (e.message.toLowerCase().includes("already verified")) {
            console.log("Already verified");
        } else {
            console.log(e);
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
