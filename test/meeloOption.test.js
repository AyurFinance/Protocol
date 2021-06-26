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

	const decimals = new BN(18);
	const tokenbits = (new BN(10)).pow(decimals);
	// const tokenbits = web3.utils.toBN(10).pow(new BN(18)

	before(async () => {
		meeloDeployer = accounts[0];

		// deploy new instance of factory & wrapper
		meeloWrapperInstance = await MeeloWrapper.new({ from: meeloDeployer });
		meeloOptionFactoryInstance = await MeeloOptionFactory.new({ from: meeloDeployer });

		// deploy mock tokens
		tokenDeployer = accounts[1];
		userA = accounts[2];
		userB = accounts[3];
		mockWethInstance = await MockWETH.new("Wrapped Ethereum", "WETH", userA, new BN(1000).mul(tokenbits), { from: tokenDeployer });
		mockDaiInstance = await MockDAI.new("DAI Stablecoin", "DAI", userB, new BN(50000).mul(tokenbits), { from: tokenDeployer });

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
		strikePrice = new BN(1800).mul(tokenbits);
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
		assert.equal((await deployedMeeloOptionsContract.strikePrice()).toString(), strikePrice.toString());
		assert.equal(await deployedMeeloOptionsContract.expiry(), expiry);
		assert.equal(await deployedMeeloOptionsContract.optionType(), MEELO_OPTION_TYPE_PUT.toString());
		assert.equal(await deployedMeeloOptionsContract.exerciseType(), MEELO_OPTION_EXERCISE_TYPE_EUROPEAN.toString());
		assert.equal(await deployedMeeloOptionsContract.underlyingAssetType(), MEELO_OPTION_UNDERLYING_ASSET_TYPE_ADDRESSABLE.toString());
		assert.equal(await deployedMeeloOptionsContract.collateralAsset(), strikeAsset);
	});

	describe("Meelo PUTs", async () => {
		let deployedMeeloPutsContractAddr;
 		let deployedMeeloPutsContract;

		before(async () => {
			deployedMeeloPutsContractAddr = await meeloOptionFactoryInstance.meeloOptions(0);
			deployedMeeloPutsContract = await MeeloOption.at(deployedMeeloPutsContractAddr); 
		});

		it("should should fail to mint meelo put option tokens directly", async () => {
			await expectRevert(
				deployedMeeloPutsContract.writeMeeloOptions(10, userA),
				"MeeloOption: Only the meeloWrapper contract can mint options"
			);
		});

		it("should fail to mint 0 meelo put option tokens via meelo wrapper", async () => {
			await expectRevert(
				meeloWrapperInstance.writeMeeloOptions(deployedMeeloPutsContractAddr, 0, userB),
				"MeeloOption: set an amount > 0 to write options"
			);
		});

		it("should fail to mint meelo put option tokens via meelo wrapper without approval", async () => {
			await expectRevert(
				meeloWrapperInstance.writeMeeloOptions(deployedMeeloPutsContractAddr, 1, userB),
				"ERC20: transfer amount exceeds allowance -- Reason given: ERC20: transfer amount exceeds allowance."
			);
		});

		it("should successfully mint 1 meelo put option tokens via meelo wrapper", async () => {
			// approve token allowance
			await mockDaiInstance.approveInternal(userB, deployedMeeloPutsContractAddr, strikePrice);
			let allowance = await mockDaiInstance.allowance(userB, deployedMeeloPutsContractAddr);
			assert.equal(allowance.toString(), strikePrice.toString());

			let amountToMint = new BN(1).mul(tokenbits);
			const newTx = await meeloWrapperInstance.writeMeeloOptions(deployedMeeloPutsContractAddr, amountToMint, userB);
			expectEvent.inTransaction(newTx.tx, deployedMeeloPutsContract, "Write", {
				optionWriter: userB,
				amount: amountToMint
			});

			let optionBalance = await deployedMeeloPutsContract.balanceOf(userB);
			assert.equal(optionBalance.toString(), amountToMint.toString());
		});
	});

	it("should deploy with correct params for a CALL Option", async () => {
		name = "WETH:DAI CALL 2500 " + (new Date(expiry * 1000).toUTCString());
		symbol = "WETH:DAI CALL 2500"
		underlyingAsset = mockWethInstance.address;
		strikeAsset = mockDaiInstance.address;
		// collateralAsset = mockDaiInstance.address;
		strikePrice = new BN(2500).mul(tokenbits);
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
		assert.equal((await deployedMeeloOptionsContract.strikePrice()).toString(), strikePrice.toString());
		assert.equal(await deployedMeeloOptionsContract.expiry(), expiry);
		assert.equal(await deployedMeeloOptionsContract.optionType(), optionType.toString());
		assert.equal(await deployedMeeloOptionsContract.exerciseType(), exerciseType.toString());
		assert.equal(await deployedMeeloOptionsContract.underlyingAssetType(), underlyingAssetType.toString());
		assert.equal(await deployedMeeloOptionsContract.collateralAsset(), underlyingAsset);
	});

	describe("Meelo CALLs", async () => {
		let deployedMeeloCallsContractAddr;
 		let deployedMeeloCallsContract;

		before(async () => {
			deployedMeeloCallsContractAddr = await meeloOptionFactoryInstance.meeloOptions(1);
			deployedMeeloCallsContract = await MeeloOption.at(deployedMeeloCallsContractAddr); 
		});

		it("should should fail to mint meelo call option tokens directly", async () => {
			await expectRevert(
				deployedMeeloCallsContract.writeMeeloOptions(10, userA),
				"MeeloOption: Only the meeloWrapper contract can mint options"
			);
		});

		it("should fail to mint 0 meelo call option tokens via meelo wrapper", async () => {
			await expectRevert(
				meeloWrapperInstance.writeMeeloOptions(deployedMeeloCallsContractAddr, 0, userA),
				"MeeloOption: set an amount > 0 to write options"
			);
		});

		it("should fail to mint meelo call option tokens via meelo wrapper without approval", async () => {
			await expectRevert(
				meeloWrapperInstance.writeMeeloOptions(deployedMeeloCallsContractAddr, 1, userA),
				"ERC20: transfer amount exceeds allowance -- Reason given: ERC20: transfer amount exceeds allowance."
			);
		});

		it("should successfully mint 1 meelo call option tokens via meelo wrapper", async () => {
			// approve token allowance
			const wethAllowance = new BN(1).mul(tokenbits)
			await mockWethInstance.approveInternal(userA, deployedMeeloCallsContractAddr, wethAllowance);
			let allowance = await mockWethInstance.allowance(userA, deployedMeeloCallsContractAddr);
			assert.equal(allowance.toString(), wethAllowance.toString());

			let amountToMint = new BN(1).mul(tokenbits);
			const newTx = await meeloWrapperInstance.writeMeeloOptions(deployedMeeloCallsContractAddr, amountToMint, userA);
			expectEvent.inTransaction(newTx.tx, deployedMeeloCallsContract, "Write", {
				optionWriter: userA,
				amount: amountToMint
			});

			let optionBalance = await deployedMeeloCallsContract.balanceOf(userA);
			assert.equal(optionBalance.toString(), amountToMint.toString());
		});
	});
});

