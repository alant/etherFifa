var FifaWorldcup = artifacts.require("./FifaWorldcup.sol");
var Ownable = artifacts.require("./Ownable.sol");

module.exports = function(deployer) {
  deployer.deploy(FifaWorldcup);
  deployer.deploy(Ownable);
};
