const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("KingAttack", function () {
  let King, king;
  let owner, attacker, alice, signers;

  beforeEach(async function() {
    [owner, attacker, alice, signers] = await ethers.getSigners();
    King = await ethers.getContractFactory("King");
    king = await King.deploy({value: ethers.utils.parseEther("10")});
    KingAttack = await ethers.getContractFactory("KingAttack");
    kingAttack = await KingAttack.connect(attacker).deploy();
  });

  describe("deployment", function() {
    it("should set the attacker", async function() {
      expect(await kingAttack.attacker()).to.equal(attacker.address);
    });
  });

  describe("#attack", function() {
    it("should be reverted if non-attacker tries", async function() {
      await expect(
        kingAttack.connect(alice).attack(king.address, { value: ethers.utils.parseEther("20") })
      ).to.be.revertedWith(
        "KingAttack: NOT_OWNER"
      );
    });

    it("should make itself new king and disable any latter's try", async function() {
      await kingAttack.connect(attacker).attack(king.address, { value: ethers.utils.parseEther("20") });
      expect(await king.prize()).to.equal(ethers.utils.parseEther("20"));

      await expect(
        alice.sendTransaction({
          to: king.address,
          value: ethers.utils.parseEther("30")
        })
      ).to.be.revertedWith(
        "KingAttack: ETH_TX_REVERTED"
      );
    });
  });
});
