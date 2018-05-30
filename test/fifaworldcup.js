var FifaWorldcup = artifacts.require("./FifaWorldcup.sol");

contract('FifaWorldcup', function (accounts) {

  it("Worldcup addGame testing", function () {
    return FifaWorldcup.deployed().then(function (instance) {
      worldcupInstance = instance;
      return worldcupInstance.addGame("Russia vs Saudi Arabia", 1528988400, { from: accounts[0] });
    }).then(function () {
      return worldcupInstance.gameCount.call();
    }).then(function (returnValue) {
      assert.equal(returnValue, 1, "game not added");
    });
  });

});
