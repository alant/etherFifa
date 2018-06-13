var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic =
  "furnace hungry scare bean swarm culture injury infant mean balcony erupt slow";

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          mnemonic,
          "https://ropsten.infura.io/8Q30zi3TAqlJ6JSCwcul"
        );
      },
      network_id: 3,
      gas: 4600000,
      gasPrice: 20000000000
    },
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // Match any network id
    },
    mainnet: {
      host: "localhost",
      network_id: 1,
      port: 8545,
      gas: 4600000,
      gasPrice: 10000000000,
      from: "0x8D012fA42370adD6268b547d955EEF603C89821A"
    }
  }
};
