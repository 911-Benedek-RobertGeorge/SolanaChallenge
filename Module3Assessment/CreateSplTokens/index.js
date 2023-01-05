import { clusterApiUrl, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import { createMint, getOrCreateAssociatedTokenAccount, mintTo, transfer } from "@solana/spl-token";
import { readFileSync, promises as fsPromises } from "fs";

(async () => {
	// Step 1: Connect to cluster and generate a new Keypair
	const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

	///get the secretKye form file
	// the wallet file should be added to .gitignore
	const contents = await fsPromises.readFile("./wallet.json", "utf-8");
	const secretKey = Uint8Array.from(contents.toString().replace("[", "").replace("]", "").split(","));

	const creatorWallet = Keypair.fromSecretKey(secretKey);

	// // Step 2: Airdrop SOL into your from wallet
	// const fromAirdrop = await connection.requestAirdrop(creatorWallet.publicKey, LAMPORTS_PER_SOL);
	// await connection.confirmTransaction(fromAirdrop, { commitment: "confirmed" });

	// Step 3: Create new token mint and get the token account of the fromWallet address
	//If the token account does not exist, create it
	const mint = await createMint(connection, creatorWallet, creatorWallet.publicKey, null, 9);
	const fromTokenAccount = await getOrCreateAssociatedTokenAccount(connection, creatorWallet, mint, creatorWallet.publicKey);

	//Step 4: Mint a new token to the from account
	let signature = await mintTo(connection, creatorWallet, mint, fromTokenAccount.address, creatorWallet.publicKey, 1000000000000000, []);
	console.log("TOKEN fx :", signature); /// 1MIL

	//Step 5: Get the token account of the to-wallet address and if it does not exist, create it
	// send coins to 2 phantom wallet addresses
	const toTokenAccount1 = await getOrCreateAssociatedTokenAccount(
		connection,
		creatorWallet,
		mint,
		new PublicKey("DQRpQJFGm6PZ3SkVrfUVminezscma9Gbec2u7TchHZAB")
	);
	const toTokenAccount2 = await getOrCreateAssociatedTokenAccount(
		connection,
		creatorWallet,
		mint,
		new PublicKey("HcecXBVHRXrYGFKHHg33aPjuPqFN2L339nwZ28JewM9s")
	);

	//Step 6: Transfer the new token to the to-wallet's token account that was just created
	signature = await transfer(
		connection,
		creatorWallet,
		fromTokenAccount.address,
		toTokenAccount1.address,
		creatorWallet.publicKey,
		50000000000000,
		[]
	);
	console.log("transfer tx1:", signature);
	signature = await transfer(
		connection,
		creatorWallet,
		fromTokenAccount.address,
		toTokenAccount2.address,
		creatorWallet.publicKey,
		100000000000000,
		[]
	);
	console.log("transfer tx2:", signature);
})();
