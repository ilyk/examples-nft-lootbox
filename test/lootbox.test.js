const {assert} = require('chai');
const {time, expectRevert} = require('@openzeppelin/test-helpers');
const CWLootBox = artifacts.require("CWLootBox");
const MockNFT = artifacts.require("MockNFT");
const VRFMock = artifacts.require("VRFMock");

let lootbox;

contract("CWLootBox", ([owner, acc1, acc2]) => {
    let minted = {1: 0, 2: 0}
    before(() => CWLootBox.deployed().then(lb => lootbox = lb))

    // it("mint restricted to owner", () =>
    //     expectRevert(lootbox.mint(acc1, 1, 1, 0x0, {from: acc1}), "Ownable: caller is not the owner."))
    // it("couldn't mint id > 2", () =>
    //     expectRevert(lootbox.mint(acc1, 3, 1, 0x0, {from: owner}), "revert"))
    // it("should not mint over cap", () => lootbox.typeCaps(1)
    //     .then(strCap => parseInt(strCap))
    //     .then(cap => expectRevert(lootbox.mint(acc1, 1, cap + 1, 0x0, {from: owner}), "revert")))
    //
    // it("should mint", () => CWLootBox.deployed()
    //     .then(lb => lootbox = lb)
    //     .then(() => lootbox.mint(acc1, '2', 10, 0x0, {from: owner}))
    //     .then(async () => {
    //         minted[2] += 10;
    //         assert.equal(await lootbox.totalSupply(2), "10", "Should be 10 tokens#2")
    //         assert.equal(await lootbox.balanceOf(acc1, 2), "10", "balanceOf acc1 token#2 should be 10")
    //     })
    // )
    it("Opening LB#1", async () => {
        // console.debug(lootbox);
        let nft, vrfMock
        await VRFMock.deployed().then(mock => vrfMock = mock)
        await lootbox.mint(acc2, 1, 1, 0)
        minted[1] ++;

        // no NFT set
        // await expectRevert(lootbox.unwrap(1, 1, {from: acc2}), "NFT contract not set")
        await MockNFT.new().then(mock => nft = mock).then(() => lootbox.setCWCards(nft.address))

        // no randomness
        await expectRevert(lootbox.unwrap(1, 1, {from: acc2}), "revert")

        // randomize
        await vrfMock.setRandom(Math.floor(Math.random() * 9999)).then(() => lootbox.getRandomNumber({from: acc2}));

        // const gas = await lootbox.unwrap.estimateGas(1, {from: acc2});
        // console.log(`Estimated gas for unwrap: ${gas}`)
        // await vrfMock.setRandom(42) // for the mock!
        // await lootbox.getRandomNumber({from: acc2})
        await lootbox.unwrap(1, 1, {from: acc2, gas: 4000000})

        await nft.balanceOf(acc2, 1).then(balance => assert.equal(balance, "1"))
        await nft.balanceOf(acc2, 2).then(balance => assert.equal(balance, "1"))
        await nft.balanceOf(acc2, 3).then(balance => assert.equal(balance, "1"))
        await nft.balanceOf(acc2, 4).then(balance => assert.equal(balance, "1"))
    })

    it("Mint all and open (this test might take a lot of time)", async () => {
        let nft, vrfMock
        await MockNFT.new().then(mock => nft = mock).then(() => lootbox.setCWCards(nft.address))
        await VRFMock.deployed().then(mock => vrfMock = mock)

        const mint1 = 380050-minted[1];
        const mint2 = 8200000-minted[2];
        await lootbox.mint(acc2, 1, mint1, 0)
        await lootbox.mint(acc2, 2, mint2, 0)

        const CARDS_TO_OPEN = 40;

        for (let i = 0; i < Math.ceil(mint1 / CARDS_TO_OPEN); i++) {
            await vrfMock.setRandom(Math.floor(Math.random() * 9999)).then(() => lootbox.getRandomNumber({from: acc2}));
            await lootbox.unwrap(1, Math.min(mint1-(CARDS_TO_OPEN*i+1), CARDS_TO_OPEN), {from: acc2, gas: 8000000})
        }
        for (let i = 0; i < Math.ceil(mint2 / CARDS_TO_OPEN); i++) {
            await vrfMock.setRandom(Math.floor(Math.random() * 9999)).then(() => lootbox.getRandomNumber({from: acc2}));
            await lootbox.unwrap(1, Math.min(mint2-(CARDS_TO_OPEN*i+1), CARDS_TO_OPEN), {from: acc2, gas: 8000000})
        }

        // Common Basic
        for (let i = 0; i < 100; ++i) {
            await nft.toId(0, 0, i).then(id => nft.balanceOf(acc2, id)).then(bal => assert.equal(bal, 200_000));
        }
        // Common Gold
        for (let i = 0; i < 100; ++i) {
            await nft.toId(0, 1, i).then(id => nft.balanceOf(acc2, id)).then(bal => assert.equal(bal, 40_000));
        }
        // Common Diamond
        for (let i = 0; i < 100; ++i) {
            await nft.toId(0, 2, i).then(id => nft.balanceOf(acc2, id)).then(bal => assert.equal(bal, 20_000));
        }
        // Common Rainbow
        for (let i = 0; i < 100; ++i) {
            await nft.toId(0, 3, i).then(id => nft.balanceOf(acc2, id)).then(bal => assert.equal(bal, 2_000));
        }

        // Rare Basic
        for (let i = 0; i < 100; ++i) {
            await nft.toId(4, 0, i).then(id => nft.balanceOf(acc2, id)).then(bal => assert.equal(bal, 40_000));
        }
        // Rare Gold
        for (let i = 0; i < 100; ++i) {
            await nft.toId(4, 1, i).then(id => nft.balanceOf(acc2, id)).then(bal => assert.equal(bal, 8_000));
        }
        // Rare Diamond
        for (let i = 0; i < 100; ++i) {
            await nft.toId(4, 2, i).then(id => nft.balanceOf(acc2, id)).then(bal => assert.equal(bal, 4_000));
        }
        // Rare Rainbow
        for (let i = 0; i < 100; ++i) {
            await nft.toId(4, 3, i).then(id => nft.balanceOf(acc2, id)).then(bal => assert.equal(bal, 400));
        }

        // Epic Basic
        for (let i = 0; i < 100; ++i) {
            await nft.toId(8, 0, i).then(id => nft.balanceOf(acc2, id)).then(bal => assert.equal(bal, 20_000));
        }
        // Epic Gold
        for (let i = 0; i < 100; ++i) {
            await nft.toId(8, 1, i).then(id => nft.balanceOf(acc2, id)).then(bal => assert.equal(bal, 4_000));
        }
        // Epic Diamond
        for (let i = 0; i < 100; ++i) {
            await nft.toId(8, 2, i).then(id => nft.balanceOf(acc2, id)).then(bal => assert.equal(bal, 2_000));
        }
        // Epic Rainbow
        for (let i = 0; i < 100; ++i) {
            await nft.toId(8, 3, i).then(id => nft.balanceOf(acc2, id)).then(bal => assert.equal(bal, 200));
        }

        // Legendary Basic
        for (let i = 0; i < 100; ++i) {
            await nft.toId(12, 0, i).then(id => nft.balanceOf(acc2, id)).then(bal => assert.equal(bal, 2_000));
        }
        // Legendary Gold
        for (let i = 0; i < 100; ++i) {
            await nft.toId(12, 1, i).then(id => nft.balanceOf(acc2, id)).then(bal => assert.equal(bal, 400));
        }
        // Legendary Diamond
        for (let i = 0; i < 100; ++i) {
            await nft.toId(12, 2, i).then(id => nft.balanceOf(acc2, id)).then(bal => assert.equal(bal, 200));
        }
        // Legendary Rainbow
        for (let i = 0; i < 100; ++i) {
            await nft.toId(12, 3, i).then(id => nft.balanceOf(acc2, id)).then(bal => assert.equal(bal, 2));
        }
    })
})
