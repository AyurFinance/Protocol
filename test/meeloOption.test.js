const MeeloWrapper = artifacts.require("MeeloWrapper");
const MeeloOption = artifacts.require("MeeloOption");
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

contract("MeeloOption", async accounts => {
	let meeloWrapperInstance;
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

	let currentTime;

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

	before(async () => {
		meeloDeployer = accounts[0];

		// deploy new instance of factory & wrapper
		meeloWrapperInstance = await MeeloWrapper.new({ from: meeloDeployer });
		meeloOptionFactoryInstance = await MeeloOptionFactory.new({ from: meeloDeployer });

		// deploy mock tokens
		tokenDeployer = accounts[1];
		userA = accounts[2];
		userB = accounts[3];
		mockWethInstance = await MockWETH.new("Wrapped Ethereum", "WETH", userA, 1000, { from: tokenDeployer });
		mockDaiInstance = await MockDAI.new("DAI Stablecoin", "DAI", userB, 50000, { from: tokenDeployer });

		// set correct options vars
		currentTime = await time.latest();
		expiry = currentTime.toNumber() + 7 * 86400; // 7 days from latest
		exerciseWindowDuration = 48 * 60 * 60; // 48 hours
		// console.log((new Date(currentTime * 1000).toUTCString()));
		// console.log((new Date(expiry * 1000).toUTCString()));
	});

	it("should deploy with correct params for a PUT Option", async () => {
		name = "WETH:DAI PUT 1800 " + (new Date(expiry * 1000).toUTCString());
		symbol = "WETH:DAI PUT 1800"
		underlyingAsset = mockWethInstance.address;
		strikeAsset = mockDaiInstance.address;
		// collateralAsset = mockDaiInstance.address;
		strikePrice = 1800;
		optionType = MEELO_OPTION_TYPE_PUT;
		exerciseType = MEELO_OPTION_EXERCISE_TYPE_EUROPEAN;
		underlyingAssetType = MEELO_OPTION_UNDERLYING_ASSET_TYPE_ADDRESSABLE;

		const newTx = await meeloOptionFactoryInstance.createMeeloOption(
			meeloWrapperInstance.address,
			name,
			symbol,
			underlyingAsset,
			strikeAsset,
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
      strikePrice: strikePrice.toString(),
      expiry: expiry.toString(),
      exerciseWindowDuration: exerciseWindowDuration.toString(),
      optionType: MEELO_OPTION_TYPE_PUT.toString(),
      exerciseType: MEELO_OPTION_EXERCISE_TYPE_EUROPEAN.toString(),
      underlyingAssetType: MEELO_OPTION_UNDERLYING_ASSET_TYPE_ADDRESSABLE.toString(),
 		});
 
 		assert.equal((await meeloOptionFactoryInstance.getMeeloOptionsCount()).toNumber(), 1);

 		const deployedMeeloOptionsContractAddr = await meeloOptionFactoryInstance.meeloOptions(0);
 		const deployedMeeloOptionsContract = await MeeloOption.at(deployedMeeloOptionsContractAddr);

		assert.equal(await deployedMeeloOptionsContract.meeloWrapper(), meeloWrapperInstance.address);
		assert.equal(await deployedMeeloOptionsContract.symbol(), symbol);
		assert.equal(await deployedMeeloOptionsContract.underlyingAsset(), underlyingAsset);
		assert.equal(await deployedMeeloOptionsContract.strikeAsset(), strikeAsset);
		assert.equal(await deployedMeeloOptionsContract.strikePrice(), strikePrice);
		assert.equal(await deployedMeeloOptionsContract.expiry(), expiry);
		assert.equal(await deployedMeeloOptionsContract.optionType(), MEELO_OPTION_TYPE_PUT.toString());
		assert.equal(await deployedMeeloOptionsContract.exerciseType(), MEELO_OPTION_EXERCISE_TYPE_EUROPEAN.toString());
		assert.equal(await deployedMeeloOptionsContract.underlyingAssetType(), MEELO_OPTION_UNDERLYING_ASSET_TYPE_ADDRESSABLE.toString());
		assert.equal(await deployedMeeloOptionsContract.collateralAsset(), strikeAsset);
	});

	it("should deploy with correct params for a CALL Option", async () => {
		name = "WETH:DAI CALL 2500 " + (new Date(expiry * 1000).toUTCString());
		symbol = "WETH:DAI CALL 2500"
		underlyingAsset = mockWethInstance.address;
		strikeAsset = mockDaiInstance.address;
		// collateralAsset = mockDaiInstance.address;
		strikePrice = 2500;
		optionType = MEELO_OPTION_TYPE_CALL;
		exerciseType = MEELO_OPTION_EXERCISE_TYPE_EUROPEAN;
		underlyingAssetType = MEELO_OPTION_UNDERLYING_ASSET_TYPE_ADDRESSABLE;

		const newTx = await meeloOptionFactoryInstance.createMeeloOption(
			meeloWrapperInstance.address,
			name,
			symbol,
			underlyingAsset,
			strikeAsset,
			strikePrice,
			expiry,
			exerciseWindowDuration,
			MEELO_OPTION_TYPE_CALL,
			exerciseType,
			underlyingAssetType, 
			{ from : meeloDeployer }
		);
		// console.log(newTx.logs);
		expectEvent(newTx, 'MeeloOptionCreated', {
      creator: meeloDeployer,
      underlyingAsset: mockWethInstance.address,
      strikeAsset: mockDaiInstance.address,
      strikePrice: strikePrice.toString(),
      expiry: expiry.toString(),
      exerciseWindowDuration: exerciseWindowDuration.toString(),
      optionType: optionType.toString(),
      exerciseType: exerciseType.toString(),
      underlyingAssetType: underlyingAssetType.toString(),
 		});
 
 		assert.equal((await meeloOptionFactoryInstance.getMeeloOptionsCount()).toNumber(), 2);

 		const deployedMeeloOptionsContractAddr = await meeloOptionFactoryInstance.meeloOptions(1);
 		const deployedMeeloOptionsContract = await MeeloOption.at(deployedMeeloOptionsContractAddr);

		assert.equal(await deployedMeeloOptionsContract.meeloWrapper(), meeloWrapperInstance.address);
		assert.equal(await deployedMeeloOptionsContract.symbol(), symbol);
		assert.equal(await deployedMeeloOptionsContract.underlyingAsset(), underlyingAsset);
		assert.equal(await deployedMeeloOptionsContract.strikeAsset(), strikeAsset);
		assert.equal(await deployedMeeloOptionsContract.strikePrice(), strikePrice);
		assert.equal(await deployedMeeloOptionsContract.expiry(), expiry);
		assert.equal(await deployedMeeloOptionsContract.optionType(), optionType.toString());
		assert.equal(await deployedMeeloOptionsContract.exerciseType(), exerciseType.toString());
		assert.equal(await deployedMeeloOptionsContract.underlyingAssetType(), underlyingAssetType.toString());
		assert.equal(await deployedMeeloOptionsContract.collateralAsset(), underlyingAsset);
	});
});

