// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts-ethereum-package/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";

import "../../interfaces/ISeniorPool.sol";
import "../../interfaces/IPoolTokens.sol";
import "../../interfaces/ITranchedPool.sol";
import "../../interfaces/IRequiresUID.sol";
import "../../interfaces/IStakingRewards.sol";
import "./Accountant.sol";
import "./BaseUpgradeablePausable.sol";
import "./ConfigHelper.sol";

/// @title Zapper
/// @notice Moves capital from the SeniorPool to TranchedPools without taking fees
contract Zapper is BaseUpgradeablePausable {
  GoldfinchConfig public config;
  using ConfigHelper for GoldfinchConfig;
  using SafeMath for uint256;

  function initialize(address owner, GoldfinchConfig _config) public initializer {
    require(owner != address(0) && address(_config) != address(0), "Owner and config addresses cannot be empty");
    __BaseUpgradeablePausable__init(owner);
    config = _config;
  }

  function moveStakeToTranchedPool(
    uint256 tokenId,
    ITranchedPool tranchedPool,
    uint256 tranche,
    uint256 usdcAmount
  ) public whenNotPaused nonReentrant {
    IStakingRewards stakingRewards = config.getStakingRewards();
    ISeniorPool seniorPool = config.getSeniorPool();

    require(validPool(tranchedPool), "Invalid pool");
    require(stakingRewards.ownerOf(tokenId) == msg.sender, "Not token owner");
    require(hasAllowedUID(tranchedPool), "Address not go-listed");

    uint256 shares = seniorPool.getNumShares(usdcAmount);
    stakingRewards.unstake(tokenId, shares);

    uint256 withdrawnAmount = seniorPool.withdraw(usdcAmount);
    require(withdrawnAmount == usdcAmount, "Withdrawn amount != requested amount");

    SafeERC20.safeApprove(config.getUSDC(), address(tranchedPool), usdcAmount);
    uint256 poolTokenId = tranchedPool.deposit(tranche, usdcAmount);
    IERC721(config.poolTokensAddress()).safeTransferFrom(address(this), msg.sender, poolTokenId);
  }

  function hasAllowedUID(ITranchedPool pool) internal view returns (bool) {
    return IRequiresUID(address(pool)).hasAllowedUID(msg.sender);
  }

  function validPool(ITranchedPool pool) internal view returns (bool) {
    return config.getPoolTokens().validPool(address(pool));
  }
}
