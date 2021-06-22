const MeeloOptionFactory = artifacts.require("MeeloOptionFactory");

contract("MeeloOptionFactory", async accounts => {
	let meeloOptionFactoryInstance;

	beforeEach(async () => {
		meeloOptionFactoryInstance = await MeeloOptionFactory.deployed();
	});

	it("should deploy", async () => {
		assert.ok(web3.utils.isAddress(meeloOptionFactoryInstance.address));
	})
});