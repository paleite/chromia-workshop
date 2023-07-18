import {
  IClient,
  SignatureProvider,
  createClient,
  newSignatureProvider,
} from "postchain-client";
import readline from "readline";

const signer1 = newSignatureProvider({ privKey: Buffer.alloc(32, "a") });
const signer2 = newSignatureProvider({ privKey: Buffer.alloc(32, "b") });
const signer3 = newSignatureProvider({ privKey: Buffer.alloc(32, "c") });
const signer4 = newSignatureProvider({ privKey: Buffer.alloc(32, "d") });

async function main() {
  const chromiaClient = await createClient({
    nodeURLPool: "http://localhost:7740",
    blockchainIID: 0,
  });

  console.log("Registering users...");
  await registerUser(chromiaClient, signer1, "Signer 1");
  await registerUser(chromiaClient, signer2, "Signer 2");
  await registerUser(chromiaClient, signer3, "Signer 3");
  await registerUser(chromiaClient, signer4, "Signer 4");

  await waitForKeyPress();

  console.log("Listing an auction...");
  await listAuction(chromiaClient, signer1, "CryptoPunk #5822");
  const auctions1 = await listAuctions(chromiaClient);
  printAuctions(auctions1);

  await waitForKeyPress();

  console.log("Placing a bid...");
  await placeBid(chromiaClient, signer2, auctions1[0].rowid, 10);
  const auctions2 = await listAuctions(chromiaClient);
  printAuctions(auctions2);

  await waitForKeyPress();

  console.log("Listing more auctions...");
  await listAuction(chromiaClient, signer1, "Merge");
  await listAuction(chromiaClient, signer2, "The First 5000 Days");
  await listAuction(chromiaClient, signer3, "Clock");
  await listAuction(chromiaClient, signer4, "HUMAN ONE");
  const auctions3 = await listAuctions(chromiaClient);
  printAuctions(auctions3);
}

async function registerUser(
  chromiaClient: IClient,
  signer: SignatureProvider,
  name: string
) {
  await chromiaClient.signAndSendUniqueTransaction(
    {
      operations: [
        { name: "auction_house.register_user", args: [signer.pubKey, name] },
      ],
      signers: [signer.pubKey],
    },
    signer
  );
}

async function listAuction(
  chromiaClient: IClient,
  signer: SignatureProvider,
  item: string
) {
  await chromiaClient.signAndSendUniqueTransaction(
    {
      operations: [
        { name: "auction_house.list_auction", args: [signer.pubKey, item] },
      ],
      signers: [signer.pubKey],
    },
    signer
  );
}

async function placeBid(
  chromiaClient: IClient,
  signer: SignatureProvider,
  rowid: number,
  amount: number
) {
  await chromiaClient.signAndSendUniqueTransaction(
    {
      operations: [
        {
          name: "auction_house.place_bid",
          args: [signer.pubKey, rowid, amount],
        },
      ],
      signers: [signer.pubKey],
    },
    signer
  );
}

async function listAuctions(chromiaClient: IClient): Promise<AuctionInfoDto[]> {
  return chromiaClient.query<{}, AuctionInfoDto[]>("auction_house.list_all");
}

function printAuctions(auctions: AuctionInfoDto[]) {
  console.log(`Found ${auctions.length} active auctions`);
  console.log(`\n======`);
  for (const auction of auctions) {
    console.log(
      `Item: ${auction.item}, listed by: ${auction.owner.name}, with ID: ${auction.rowid}`
    );
    if (auction.bid) {
      console.log(
        `Leading bid: ${auction.bid.amount}, by: ${auction.bid.user.name}, at: ${auction.bid.timestamp}`
      );
    }
    console.log(`======`);
  }

  console.log();
}

function waitForKeyPress(): Promise<void> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    console.log("Press ENTER to proceed...");
    rl.question("", () => {
      rl.close();
      resolve();
    });
  });
}

type AuctionInfoDto = {
  rowid: number;
  item: string;
  owner: UserInfoDto;
  start: number;
  end: number;
  bid?: BidInfoDto;
};

type UserInfoDto = {
  name: string;
  pubkey: string;
};

type BidInfoDto = {
  user: UserInfoDto;
  amount: number;
  timestamp: number;
};

main()
  .then(() => console.log("Executed Auction House script successfully"))
  .catch((e) => console.log("Error executing the Auction House script: ", e));
