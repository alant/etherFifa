var FifaWorldcup = artifacts.require("./FifaWorldCup.sol");

contract("FifaWorldCup", function(accounts) {
  it("Worldcup addGame testing", function() {
    return FifaWorldcup.deployed()
      .then(function(instance) {
        worldcupInstance = instance;
        return worldcupInstance.addGame(
          "Russia",
          "Saudi Arabia",
          parseInt(Date.now() / 1000) + 600,
          { from: accounts[0] }
        );
      })
      .then(function() {
        return worldcupInstance.getGameCount({ from: accounts[0] });
      })
      .then(function(returnValue) {
        assert.equal(returnValue, 1, "game not added");
      });
  });
  it("Worldcup game 1 still can vote", function() {
    return FifaWorldcup.deployed()
      .then(function(instance) {
        // console.log(web3.eth.getBalance(accounts[0]));
        return instance.canVote(0, { from: accounts[1] });
      })
      .then(function(returnValue) {
        assert.equal(returnValue, true, "game alreayd started , cannot vote");
      });
  });
  it("cast vote 1", function() {
    return FifaWorldcup.deployed()
      .then(function(instance) {
        console.log(accounts[1]);
        return instance.castVote(0, 1, {
          from: accounts[1],
          value: 1000000000000000000
        });
      })
      .then(function(returnValue) {
        console.log("success");
      });
  });
  it("cast vote 2", function() {
    return FifaWorldcup.deployed()
      .then(function(instance) {
        return instance.castVote(0, 2, {
          from: accounts[2],
          value: 2000000000000000000
        });
      })
      .then(function(returnValue) {
        console.log("success");
      });
  });
  it("cast vote 3", function() {
    return FifaWorldcup.deployed()
      .then(function(instance) {
        return instance.castVote(0, 3, {
          from: accounts[3],
          value: 2000000000000000000
        });
      })
      .then(function(returnValue) {
        console.log("success");
      });
  });
  it("cast vote 4", function() {
    return FifaWorldcup.deployed()
      .then(function(instance) {
        return instance.castVote(0, 1, {
          from: accounts[4],
          value: 1000000000000000000
        });
      })
      .then(function(returnValue) {
        console.log("success");
      });
  });
  it("account 4 vote direction", function() {
    return FifaWorldcup.deployed()
      .then(function(instance) {
        return instance.getVote(0, accounts[4], { from: accounts[4] });
      })
      .then(function(returnValue) {
        assert.equal(returnValue, 1, "account 4 vote direction not correct");
        // console.log("account 4 balance: " + web3.eth.getBalance(accounts[4]));
      });
  });
  it("set result to 1", function() {
    return FifaWorldcup.deployed()
      .then(function(instance) {
        return instance.setResult(0, 1, { from: accounts[0] });
      })
      .then(function(returnValue) {
        console.log("success");
      });
  });
  it("get winning account 4", function() {
    return FifaWorldcup.deployed()
      .then(function(instance) {
        return instance.getWinning(0, accounts[4], { from: accounts[4] });
      })
      .then(function(returnValue) {
        console.log("winning: " + returnValue);
      });
  });
  it("withdraw account 4", function() {
    return FifaWorldcup.deployed()
      .then(function(instance) {
        return instance.withdraw(0, { from: accounts[4] });
      })
      .then(function(returnValue) {
        console.log("withdraw 4: " + JSON.stringify(returnValue));
      });
  });
  it("withdraw account 1", function() {
    return FifaWorldcup.deployed()
      .then(function(instance) {
        return instance.withdraw(0, { from: accounts[1] });
      })
      .then(function(returnValue) {
        console.log("withdraw 1: " + JSON.stringify(returnValue));
      });
  });
  it("getResearchPot", function() {
    return FifaWorldcup.deployed()
      .then(function(instance) {
        return instance.getResearchPot({ from: accounts[0] });
      })
      .then(function(returnValue) {
        console.log("research pot: " + returnValue);
      });
  });
  it("setVote to no", function() {
    var contractInstance;
    return FifaWorldcup.deployed()
      .then(function(instance) {
        contractInstance = instance;
        return instance.setCanVote(0, false, { from: accounts[0] });
      })
      .then(function() {
        return contractInstance.canVote(0, { from: accounts[0] });
      })
      .then(function(returnValue) {
        assert.equal(returnValue, false, "can still vote, wrong!");
      });
  });
  it("setVote to yes", function() {
    var contractInstance;
    return FifaWorldcup.deployed()
      .then(function(instance) {
        contractInstance = instance;
        return instance.setCanVote(0, true, { from: accounts[0] });
      })
      .then(function() {
        return contractInstance.canVote(0, { from: accounts[0] });
      })
      .then(function(returnValue) {
        assert.equal(returnValue, true, "cannot vote, wrong!");
      });
  });
  it("set start time to now - 100", function() {
    var contractInstance;
    return FifaWorldcup.deployed()
      .then(function(instance) {
        contractInstance = instance;
        return instance.setStartTime(0, parseInt(Date.now() / 1000) - 100, {
          from: accounts[0]
        });
      })
      .then(function() {
        return contractInstance.canVote(0, { from: accounts[0] });
      })
      .then(function(returnValue) {
        assert.equal(returnValue, false, "still can vote, wrong!");
      });
  });
  it("should not be able to set time", function() {
    var contractInstance;
    return FifaWorldcup.deployed()
      .then(function(instance) {
        contractInstance = instance;
        return instance.setStartTime(0, parseInt(Date.now() / 1000) - 100, {
          from: accounts[1]
        });
      })
      .then(function() {
        return contractInstance.canVote(0, { from: accounts[0] });
      })
      .then(function(returnValue) {
        assert.equal(returnValue, false, "still can vote, wrong!");
      });
  });
  it("should not be able to set canVote", function() {
    var contractInstance;
    return FifaWorldcup.deployed()
      .then(function(instance) {
        contractInstance = instance;
        return instance.setCanVote(0, false, {
          from: accounts[1]
        });
      })
      .then(function() {
        return contractInstance.canVote(0, { from: accounts[0] });
      })
      .then(function(returnValue) {
        assert.equal(returnValue, false, "still can vote, wrong!");
      });
  });
});
