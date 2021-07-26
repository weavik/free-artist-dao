/* global web3 */
import hre from "hardhat"
const {deployments, artifacts} = hre
import {expect, BN, deployAllContracts, usdcVal, createPoolWithCreditLine} from "./testHelpers"
import {interestAprAsBN, leverageRatioAsBN, LEVERAGE_RATIO_DECIMALS, TRANCHES} from "../blockchain_scripts/deployHelpers"
let accounts, owner, borrower

describe("FixedLeverageRatioStrategy", () => {
  let tranchedPool, seniorFund, strategy, juniorInvestmentAmount
  let leverageRatio = leverageRatioAsBN("4")

  const setupTest = deployments.createFixture(async ({deployments}) => {
    ;[owner, borrower] = await web3.eth.getAccounts()

    const {seniorFund, goldfinchConfig, goldfinchFactory, usdc} = await deployAllContracts(deployments, {
      fromAccount: owner,
    })

    await goldfinchConfig.bulkAddToGoList([owner, borrower])

    juniorInvestmentAmount = usdcVal(10000)
    let limit = juniorInvestmentAmount.mul(new BN(10))
    let interestApr = interestAprAsBN("5.00")
    let paymentPeriodInDays = new BN(30)
    let termInDays = new BN(365)
    let lateFeeApr = new BN(0)
    let juniorFeePercent = new BN(20)
    ;({tranchedPool} = await createPoolWithCreditLine({
      people: {owner, borrower},
      goldfinchFactory,
      juniorFeePercent: juniorFeePercent.toNumber(),
      limit,
      interestApr,
      paymentPeriodInDays,
      termInDays,
      lateFeeApr,
      usdc,
    }))

    let contractName = "FixedLeverageRatioStrategy"
    const deployResult = await deployments.deploy(contractName, {
      from: owner,
      args: [leverageRatio.toString()],
    })
    const strategy = await artifacts.require(contractName).at(deployResult.address)

    await tranchedPool.deposit(TRANCHES.Junior, juniorInvestmentAmount)

    return {tranchedPool, seniorFund, strategy}
  })

  beforeEach(async () => {
    accounts = await web3.eth.getAccounts()
    ;[owner] = accounts
    ;({tranchedPool, seniorFund, strategy} = await setupTest())
  })

  describe("estimateInvestment", () => {
    it("levers junior investment using the leverageRatio", async () => {
      let amount = await strategy.estimateInvestment(seniorFund.address, tranchedPool.address)

      await expect(amount).to.bignumber.equal(juniorInvestmentAmount.mul(leverageRatio).div(LEVERAGE_RATIO_DECIMALS))
    })

    context("junior pool is not locked", () => {
      it("still returns investment amount", async () => {
        let amount = await strategy.estimateInvestment(seniorFund.address, tranchedPool.address)

        await expect(amount).to.bignumber.equal(juniorInvestmentAmount.mul(leverageRatio).div(LEVERAGE_RATIO_DECIMALS))
      })
    })

    context("pool is locked", () => {
      it("still returns investment amount", async () => {
        await tranchedPool.lockJuniorCapital({from: borrower})
        await tranchedPool.lockPool({from: borrower})

        let amount = await strategy.estimateInvestment(seniorFund.address, tranchedPool.address)

        await expect(amount).to.bignumber.equal(juniorInvestmentAmount.mul(leverageRatio).div(LEVERAGE_RATIO_DECIMALS))
      })
    })

    context("senior principal is already partially invested", () => {
      it("invests up to the levered amount", async () => {
        let existingSeniorPrincipal = juniorInvestmentAmount.add(new BN(10))
        await tranchedPool.deposit(TRANCHES.Senior, existingSeniorPrincipal)

        let amount = await strategy.estimateInvestment(seniorFund.address, tranchedPool.address)

        await expect(amount).to.bignumber.equal(juniorInvestmentAmount.mul(leverageRatio).div(LEVERAGE_RATIO_DECIMALS).sub(existingSeniorPrincipal))
      })
    })

    context("senior principal already exceeds investment amount", () => {
      it("does not invest", async () => {
        let existingSeniorPrincipal = juniorInvestmentAmount.add(
          juniorInvestmentAmount.mul(leverageRatio).div(LEVERAGE_RATIO_DECIMALS).add(new BN(1))
        )
        await tranchedPool.deposit(TRANCHES.Senior, existingSeniorPrincipal)

        let amount = await strategy.estimateInvestment(seniorFund.address, tranchedPool.address)

        await expect(amount).to.bignumber.equal(new BN(0))
      })
    })
  })

  describe("invest", () => {
    it("levers junior investment using the leverageRatio", async () => {
      await tranchedPool.lockJuniorCapital({from: borrower})

      let amount = await strategy.invest(seniorFund.address, tranchedPool.address)

      await expect(amount).to.bignumber.equal(juniorInvestmentAmount.mul(leverageRatio).div(LEVERAGE_RATIO_DECIMALS))
    })

    context("junior pool is not locked", () => {
      it("does not invest", async () => {
        let amount = await strategy.invest(seniorFund.address, tranchedPool.address)

        await expect(amount).to.bignumber.equal(new BN(0))
      })
    })

    context("pool is locked", () => {
      it("does not invest", async () => {
        await tranchedPool.lockJuniorCapital({from: borrower})
        await tranchedPool.lockPool({from: borrower})

        let amount = await strategy.invest(seniorFund.address, tranchedPool.address)

        await expect(amount).to.bignumber.equal(new BN(0))
      })
    })

    context("senior principal is already partially invested", () => {
      it("invests up to the levered amount", async () => {
        let existingSeniorPrincipal = juniorInvestmentAmount.add(new BN(10))
        await tranchedPool.deposit(TRANCHES.Senior, existingSeniorPrincipal)
        await tranchedPool.lockJuniorCapital({from: borrower})

        let amount = await strategy.invest(seniorFund.address, tranchedPool.address)

        await expect(amount).to.bignumber.equal(juniorInvestmentAmount.mul(leverageRatio).div(LEVERAGE_RATIO_DECIMALS).sub(existingSeniorPrincipal))
      })
    })

    context("senior principal already exceeds investment amount", () => {
      it("does not invest", async () => {
        let existingSeniorPrincipal = juniorInvestmentAmount.add(
          juniorInvestmentAmount.mul(leverageRatio).div(LEVERAGE_RATIO_DECIMALS).add(new BN(1))
        )
        await tranchedPool.deposit(TRANCHES.Senior, existingSeniorPrincipal)
        await tranchedPool.lockJuniorCapital({from: borrower})

        let amount = await strategy.invest(seniorFund.address, tranchedPool.address)

        await expect(amount).to.bignumber.equal(new BN(0))
      })
    })
  })
})
