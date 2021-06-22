const MeeloOptionFactory = artifacts.require("MeeloOptionFactory");

module.exports = async (deployer, network, accounts) => {
  const deployingAccount = accounts[0];
  console.log(`deploying all contracts from ${deployingAccount}`);

  // deploy MeeloOptionsFactory
  await deployer.deploy(MeeloOptionFactory, { from: deployingAccount });
  const meeloOptionsFactoryInstance = await MeeloOptionFactory.deployed();
};
