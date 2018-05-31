var FifaWorldcup = artifacts.require("./FifaWorldCup.sol");

contract('FifaWorldCup', function (accounts) {

  it("Worldcup addGame testing", function () {
    return FifaWorldcup.deployed().then(function (instance) {
      worldcupInstance = instance;
      return worldcupInstance.addGame("Russia vs Saudi Arabia", 1528988400, { from: accounts[0] });
    }).then(function () {
      return worldcupInstance.getGameCount({ from: accounts[0] });
    }).then(function (returnValue) {
      assert.equal(returnValue, 1, "game not added");
    });
  });
  it("Worldcup game 1 not started yet", function () {
    return FifaWorldcup.deployed().then(function (instance) {
      // console.log(web3.eth.getBalance(accounts[0]));
      worldcupInstance = instance;
      return instance.canVote(0, { from: accounts[0] });
    }).then(function (returnValue) {
      assert.equal(returnValue, true, "game alreayd started , cannot vote");
    });
  });
  it("Worldcup addGame testing", function () {
    return FifaWorldcup.deployed().then(function (instance) {
      worldcupInstance = instance;
      return worldcupInstance.addGame("Russia vs Saudi Arabia",parseInt(Date.now() / 1000) , { from: accounts[0] });
    }).then(function () {
      return worldcupInstance.getGameCount({ from: accounts[0] });
    }).then(function (returnValue) {
      assert.equal(returnValue, 2, "game not added");
    });
  });
  it("Worldcup game 2 not started", function () {
    return FifaWorldcup.deployed().then(function (instance) {
      // console.log(web3.eth.getBalance(accounts[0]));
      worldcupInstance = instance;
      return instance.canVote(1, { from: accounts[0] });
    }).then(function (returnValue) {
      // console.log("one min delay: " + returnValue);
      assert.equal(returnValue, true, "can not vote anymore");
    });
  });
  it("Worldcup change delay", function () {
    return FifaWorldcup.deployed().then(function (instance) {
      worldcupInstance = instance;
      return worldcupInstance.setDelay(0, { from: accounts[0] });
    }).then(function () {
      return worldcupInstance.canVote(1, { from: accounts[0] });
    }).then(function (returnValue) {
      // console.log("starttime : " + returnValue + ". now: " + parseInt(Date.now() / 1000));
      assert.equal(returnValue, false, "still can vote :(");
    });
  });
});
