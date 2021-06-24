const MeeloOptionFactory = artifacts.require("MeeloOptionFactory");
const MockWETH = artifacts.require("MockWETH");
const MockDAI = artifacts.require("MockDAI");

const {
  BN,           // Big Number support
  constants,    // Common constants, like the zero address and largest integers
  expectEvent,  // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
  time,
} = require('@openzeppelin/test-helpers');

const MEELO_OPTION_TYPE_PUT = 0;
const MEELO_OPTION_TYPE_CALL = 1;

const MEELO_OPTION_EXERCISE_TYPE_EUROPEAN = 0;
const MEELO_OPTION_EXERCISE_TYPE_AMERICAN = 1;

const MEELO_OPTION_UNDERLYING_ASSET_TYPE_ADDRESSABLE = 0;
const MEELO_OPTION_UNDERLYING_ASSET_TYPE_NON_ADDRESSABLE = 1;

contract("MeeloOptionFactory", async accounts => {
	let meeloOptionFactoryInstance;

	const SECONDS_IN_DAY = 86400;

	// token contracts
	let mockWethInstance;
	let mockDaiInstance;

	// accounts
	let meeloDeployer;
	let tokenDeployer;
	let userA;
	let userB;

	// MeeloOptions Contract
	let meeloOptionsContractInstance;

	// options config
	let name;
	let symbol
	let underlyingAsset;
	let strikeAsset;
	let collateralAsset;
	let strikePrice;
	let expiry;
	let exerciseWindowDuration;
	let optionType;
	let exerciseType;
	let underlyingAssetType;

	beforeEach(async () => {
		meeloOptionFactoryInstance = await MeeloOptionFactory.deployed();

		// deploy new instance of factory
		meeloDeployer = accounts[0];
		meeloOptionFactoryInstance = await MeeloOptionFactory.new({ from: meeloDeployer });

		// deploy mock tokens
		tokenDeployer = accounts[1];
		userA = accounts[2];
		userB = accounts[3];
		mockWethInstance = await MockWETH.new("Wrapped Ethereum", "WETH", userA, 1000, { from: tokenDeployer });
		mockDaiInstance = await MockDAI.new("DAI Stablecoin", "DAI", userB, 50000, { from: tokenDeployer });
	});

	it("should deploy", async () => {
		assert.ok(web3.utils.isAddress(meeloOptionFactoryInstance.address));
	});

	it("should not contain any options contract by default", async () => {
		const deployedOptionsCount = await meeloOptionFactoryInstance.getMeeloOptionsCount();
		assert.equal(deployedOptionsCount, 0);
	});

	it("should deploy a PUT options contract correctly", async () => {
		const currentTime = await time.latest();
		expiry = currentTime + 7 * 86400; // 7 days from latest
		exerciseWindowDuration = 48 * 60 * 60; // 48 hours
		name = "WETH:DAI PUT 1800 " + (new Date(expiry * 1000).toUTCString());
		symbol = "WETH:DAI PUT 1800"
		underlyingAsset = mockWethInstance.address;
		strikeAsset = mockDaiInstance.address;
		collateralAsset = mockDaiInstance.address;
		strikePrice = 1800;
		optionType = MEELO_OPTION_TYPE_PUT;
		exerciseType = MEELO_OPTION_EXERCISE_TYPE_EUROPEAN;
		underlyingAssetType = MEELO_OPTION_UNDERLYING_ASSET_TYPE_ADDRESSABLE;

		const newTx = await meeloOptionFactoryInstance.createMeeloOption(
			name,
			symbol,
			underlyingAsset,
			strikeAsset,
			collateralAsset,
			strikePrice,
			expiry,
			exerciseWindowDuration,
			optionType,
			exerciseType,
			underlyingAssetType, 
			{ from : meeloDeployer }
		);
		// console.log(newTx.logs);
		expectEvent(newTx, 'MeeloOptionCreated', {
	        creator: meeloDeployer,
	        underlyingAsset: mockWethInstance.address,
	        strikeAsset: mockDaiInstance.address,
	        collateralAsset: mockDaiInstance.address,
	        strikePrice: strikePrice.toString(),
	        expiry: expiry.toString(),
	        exerciseWindowDuration: exerciseWindowDuration.toString(),
	        optionType: MEELO_OPTION_TYPE_PUT.toString(),
	        exerciseType: MEELO_OPTION_EXERCISE_TYPE_EUROPEAN.toString(),
	        underlyingAssetType: MEELO_OPTION_UNDERLYING_ASSET_TYPE_ADDRESSABLE.toString(),
	    });
	});
});

