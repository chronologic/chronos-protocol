const LibChronosParser = artifacts.require('./LibChronosParser.sol');
const MockChronosParser = artifacts.require('./MockChronosParser.sol');

module.exports = (deployer) => {
  deployer.deploy(LibChronosParser)
  .then(() => {
    deployer.link(LibChronosParser, MockChronosParser);
    return deployer.deploy(MockChronosParser);
  })
}