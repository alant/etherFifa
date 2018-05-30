var DateTime = artifacts.require("./DateTime.sol");

contract('DateTime', function (accounts) {

  it("...2000 is leapyear.", function () {
    return DateTime.deployed().then(function (instance) {
      dateTimeInstance = instance;
      return dateTimeInstance.isLeapYear(2000, { from: accounts[0] });
    }).then(function (returnValue) {
      assert.equal(returnValue, true, "2000 year is not leapyear");
    });
  });
});
