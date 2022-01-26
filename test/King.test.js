const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("King", function () {
  let King, king;
  let owner, alice, bob, carol, signers;

  beforeEach(async function() {
    [owner, alice, bob, carol, signers] = await ethers.getSigners();
    King = await ethers.getContractFactory("King");
    king = await King.deploy({value: ethers.utils.parseEther("10")});
  });

  describe("deployment", function() {
    it("should set the owner, king, prize", async function() {
      expect(await king.owner()).to.equal(owner.address);
      expect(await king.prize()).to.equal(ethers.utils.parseEther("10"));
    });
  });

  describe("receive", function() {
    it("should be reverted if non-owner tries with amount less than prize", async function() {
      await expect(
        alice.sendTransaction({
          to: king.address,
          value: ethers.utils.parseEther("5")
        })
      ).to.be.reverted;
    });

    it("should not to be reverted if owner tries with amount less than prize", async function() {
      await expect(
        owner.sendTransaction({
          to: king.address,
          value: ethers.utils.parseEther("5")
        })
      ).not.to.be.reverted;
    });

    it("should change king and prize and transfer Ether to the previous king", async function() {
      const ownerBalance = await ethers.provider.getBalance(owner.address);
      await alice.sendTransaction({ to: king.address, value: ethers.utils.parseEther("20") });
      expect(await king.prize()).to.equal(ethers.utils.parseEther("20"));
      expect(await ethers.provider.getBalance(owner.address)).to.gt(ownerBalance);
    });
  });
});
