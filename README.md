# Chromia Workshop

## Prerequisites
1. Install JDK 17
2. Install Docker
3. [Install Chromia CLI](https://docs.chromia.com/getting-started/dev-setup/backend/cli-installation)
4. [Install Rell VS Code Plugin](https://docs.chromia.com/getting-started/dev-setup/backend/vscode-installation)

## Auction House

In this workshop we will build a basic auction house.

## Run a local node

After having a local Postgres started you can run a local node by executing the command below.

```bash
chr node start
```

For convenience I've packaged defined a `postgres` in `docker-compose.yml` and provided a script to easily start it.

## Seeding data
We are going to test out the updated typescript `postchain-client` and I've tested a test script for this under `client/ah.ts`.

You can execute it by running:
```bash
npm run auctions
```

## Query your local node

Next lets try to query the node to list all the auctions.
```bash
chr query auction_house.list_all
```

## Generating a keypair
In order to send transactions we will need a `keypair`.
```bash
chr keygen
```
Create a `.secret` file in the project and store your credentials, i.e.
```
privkey=...
pubkey=...
mnemonic=...
```

## Sending transactions to your local node
The contract of the dapp specifies that we need to register a user, so let's do that first.
```bash
chr tx --secret .secret --await auction_house.register_user <pubkey> <name>
```

Try if you can place a bid of `10` on any of the auctions.

## Updating the code of a local node

Modify the code so that auctions includes a default buyout price 25 and if a bid matches or is above that, then the auction is instantly settled and a balance of 15 is transferred.

After that, update the code that runs on the node.

```bash
chr node update
```