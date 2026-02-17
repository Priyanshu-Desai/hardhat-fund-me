# Hardhat Fund Me

A minimal fund-me smart contract project built with Hardhat and Chainlink price feeds. Users can fund the contract with ETH, and the owner can withdraw accumulated funds.

## Features

- Accepts ETH contributions and tracks funders
- Uses Chainlink price feeds for USD conversion
- Owner-only withdrawals
- Unit and staging tests

## Tech Stack

- Solidity
- Hardhat
- JavaScript
- Chainlink Contracts

## Project Structure

- contracts/ - Solidity contracts
- deploy/ - Deployment scripts
- scripts/ - Interaction scripts
- test/ - Unit and staging tests

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file (optional for local work):

```bash
SEPOLIA_RPC_URL=
PRIVATE_KEY=
ETHERSCAN_API_KEY=
COINMARKETCAP_API_KEY=
```

## Compile

```bash
npx hardhat compile
```

## Test

```bash
npx hardhat test
```

For staging tests on Sepolia:

```bash
npx hardhat test --network sepolia
```

## Deploy

Default Hardhat network:

```bash
npx hardhat deploy
```

Local deployment (Hardhat node):

```bash
npx hardhat node
npx hardhat deploy --network localhost
```

Sepolia deployment:

```bash
npx hardhat deploy --network sepolia
```

## Scripts

Fund the contract:

```bash
npx hardhat run scripts/fund.js --network localhost
```

Withdraw funds (owner only):

```bash
npx hardhat run scripts/withdraw.js --network localhost
```

## Coverage

```bash
npx hardhat coverage
```

## Notes

- Update `helper-hardhat-config.js` for custom networks or price feeds.
- The owner is the deployer address.

## License

MIT
