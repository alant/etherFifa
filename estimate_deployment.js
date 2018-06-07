var Fifa = artifacts.require("contracts/FifaWorldCup.sol");
var solc = require('solc')

module.exports = function(callback) {

    Fifa.web3.eth.getGasPrice(function(error, result){ 
        var gasPrice = Number(result);
        console.log("Gas Price is " + gasPrice + " wei"); // "10000000000000"

        var FifaContract = web3.eth.contract(Fifa._json.abi);
        var contractData = FifaContract.new.getData({data: Fifa._json.bytecode});
        var gas = Number(web3.eth.estimateGas({data: contractData}))


        console.log("gas estimation = " + gas + " units");
        console.log("gas cost estimation = " + (gas * gasPrice) + " wei");
        console.log("gas cost estimation = " + Fifa.web3.fromWei((gas * gasPrice), 'ether') + " ether");

    });
};