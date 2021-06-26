const MeeloWrapper = artifacts.require("MeeloWrapper");

contract("MeeloWrapper", async accounts => {
	let meeloWrapperInstance;

	beforeEach(async () => {
		meeloWrapperInstance = await MeeloWrapper.new({ from: accounts[0] });
	});

	it("should deploy", async () => {
		assert.ok(web3.utils.isAddress(meeloWrapperInstance.address));
	});
});

