const fs = require('fs')
const assert = require('assert-plus')
const commander = require('commander')
const packageJson = require('../package.json')
const path = require('path')
const goofy = require('app/core/goofy')
const BlockchainManager = require('app/core/managers/blockchain')
const P2PInterface = require('app/api/p2p/p2pinterface')
const DB = require('app/core/dbinterface')
const WebhookManager = require('app/core/managers/webhook')
const QueueManager = require('app/core/managers/queue')
const DependencyHandler = require('app/core/dependency-handler')
const PublicAPI = require('app/api/public')

commander
  .version(packageJson.version)
  .option('-c, --config <path>', 'config files path')
  .option('-i, --interactive', 'launch cli')
  .parse(process.argv)

assert.string(commander.config, 'commander.config')

if (!fs.existsSync(path.resolve(commander.config))) {
  throw new Error('The directory does not exist or is not accessible because of security settings.')
}

const config = require('app/core/config')
let blockchainManager = null
let p2p = null

process.on('unhandledRejection', (reason, p) => {
  goofy.error('Unhandled Rejection at: Promise', p, 'reason:', reason)
})

config.init({
  api: {
    p2p: require(path.resolve(commander.config, 'api/p2p')),
    public: require(path.resolve(commander.config, 'api/public'))
  },
  webhooks: require(path.resolve(commander.config, 'webhooks')),
  server: require(path.resolve(commander.config, 'server')),
  genesisBlock: require(path.resolve(commander.config, 'genesis-block.json')),
  network: require(path.resolve(commander.config, 'network'))
})
.then(() => goofy.init(config.server.logging.console, config.server.logging.file, config.network.name))
.then(() => (blockchainManager = new BlockchainManager(config)))
.then(() => goofy.info('Mounting Dependencies...'))
.then(() => DependencyHandler.checkDatabaseLibraries(config))
.then(() => goofy.info('Mounting Queue Manager...'))
.then(() => new QueueManager(config.server.queue))
.then(() => goofy.info('Mounting Webhook Manager...'))
.then(() => new WebhookManager(config.webhooks).mount())
.then(() => goofy.info('Mounting Database Interface...'))
.then(() => DB.create(config.server.db))
.then(db => blockchainManager.attachDBInterface(db))
.then(() => goofy.info('Mounting P2P Interface...'))
.then(() => (p2p = new P2PInterface(config)))
.then(() => p2p.warmup())
.then(() => blockchainManager.attachNetworkInterface(p2p))
.then(() => goofy.info('Mounting Blockchain Manager...'))
.then(() => blockchainManager.start())
.then(() => blockchainManager.isReady())
.then(() => goofy.info('Mounting Public API...'))
.then(() => PublicAPI(config))
.catch(fatal => goofy.error('fatal error', fatal))
