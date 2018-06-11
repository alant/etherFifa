var DateTime = artifacts.require("./DateTime.sol");
var FifaWorldcup = artifacts.require("./FifaWorldcup.sol");
var Ownable = artifacts.require("./Ownable.sol");

module.exports = function(deployer) {
  deployer.deploy(DateTime);
  deployer.deploy(FifaWorldcup);
  deployer.deploy(Ownable);
};
