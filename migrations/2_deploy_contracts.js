var SimpleStorage = artifacts.require("./SimpleStorage.sol");
var DateTime = artifacts.require("./DateTime.sol");
var FifaWorldcup = artifacts.require("./FifaWorldcup.sol");

module.exports = function(deployer) {
  deployer.deploy(SimpleStorage);
  deployer.deploy(DateTime);
  deployer.deploy(FifaWorldcup);
};
