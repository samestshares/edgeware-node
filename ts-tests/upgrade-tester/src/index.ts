import path from 'path';
import TestRunner from './testRunner';
import StateTest from './stateTest';

import { factory, formatFilename } from './logging';
const log = factory.getLogger(formatFilename(__filename));

const CHAINSPEC = 'dev';
const BINARY_PATH = '../../../edgeware-node-3.0.8/target/release/edgeware';
const CHAIN_BASE_PATH = './db';
const ACCOUNTS = [ '//Alice' ];
const SS58_PREFIX = 42; // default for testing chain specs

const UPGRADE_BINARY = '../../target/release/edgeware';
const UPGRADE_CODE = '../../edgeware_runtime.wasm';
const SUDO_SEED = '//Alice';

async function main() {
  // construct some migration tests
  // TODO: make this a part of the arg initialization
  const tests: StateTest[] = [];
  const BalanceQueryTest = (await import('./tests/balanceQuery')).default;
  tests.push(new BalanceQueryTest(ACCOUNTS, SS58_PREFIX));

  // construct tester
  const tester = new TestRunner(tests, {
    chainspec: CHAINSPEC,
    binaryPath: BINARY_PATH,
    chainBasePath: CHAIN_BASE_PATH,
    accountSeeds: ACCOUNTS,
    ss58Prefix: SS58_PREFIX,
    chainLogPath: path.join(CHAIN_BASE_PATH, 'out.log'),
    // upgrade: null,
    upgrade: {
      codePath: UPGRADE_CODE,
      binaryPath: UPGRADE_BINARY,
      sudoSeed: SUDO_SEED,
    },
  });

  try {
    await tester.run();
    process.exit(0);
  } catch (e) {
    log.error(`TESTER FAILURE: ${e.message}`);
    process.exit(1);
  }
}

// kick off test script
main();
