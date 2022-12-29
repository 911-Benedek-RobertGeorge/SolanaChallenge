// Import Solana web3 functionalities
const {
	Connection,
	PublicKey,
	clusterApiUrl,
	Keypair,
	LAMPORTS_PER_SOL,
	Transaction,
	SystemProgram,
	sendAndConfirmRawTransaction,
	sendAndConfirmTransaction,
} = require("@solana/web3.js");

//const myWallet = Keypair.generate();

//console.log(myWallet);

const DEMO_FROM_SECRET_KEY = new Uint8Array([
	10, 41, 105, 180, 25, 89, 116, 100, 74, 173, 134, 8, 194, 106, 21, 28, 134, 208, 137, 230, 62, 224, 64, 21, 143, 154, 171, 123, 216, 39, 168, 166,
	230, 112, 116, 137, 246, 47, 233, 8, 0, 144, 136, 78, 248, 147, 49, 30, 126, 241, 212, 145, 83, 53, 105, 223, 117, 217, 235, 211, 137, 101, 249,
	105,
]);
const DEMO_FROM_PUBLIC_KEY = new Uint8Array([
	230, 112, 116, 137, 246, 47, 233, 8, 0, 144, 136, 78, 248, 147, 49, 30, 126, 241, 212, 145, 83, 53, 105, 223, 117, 217, 235, 211, 137, 101, 249,
	105,
]);

const transferSol = async () => {
	const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

	// Get Keypair from Secret Key
	var from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

	// Aidrop 2 SOL to Sender wallet
	console.log("Airdopping some SOL to Sender wallet!");
	const fromAirDropSignature = await connection.requestAirdrop(new PublicKey(from.publicKey), 2 * LAMPORTS_PER_SOL);

	var balanceFROM = await getWalletBalance(from.publicKey);
	console.log(`FROM Wallet balance: ${balanceFROM / LAMPORTS_PER_SOL} SOL`);
	var balanceToTransfer = BigInt(balanceFROM) / BigInt(2);
	// Other things to try:
	// 1) Form array from userSecretKeys
	// const from = Keypair.fromSecretKey(Uint8Array.from(userSecretKey));
	// 2) Make a new Keypair (starts with 0 SOL)
	// const from = Keypair.generate();

	// Generate another Keypair (account we'll be sending to)
	const to = Keypair.generate();

	// Latest blockhash (unique identifer of the block) of the cluster
	let latestBlockHash = await connection.getLatestBlockhash();

	// Confirm transaction using the last valid block height (refers to its time)
	// to check for transaction expiration
	await connection.confirmTransaction({
		blockhash: latestBlockHash.blockhash,
		lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
		signature: fromAirDropSignature,
	});

	console.log("Airdrop completed for the Sender account");

	// Send money from "from" wallet and into "to" wallet
	var transaction = new Transaction().add(
		SystemProgram.transfer({
			fromPubkey: from.publicKey,
			toPubkey: to.publicKey,
			lamports: balanceToTransfer,
		})
	);

	// Sign transaction
	var signature = await sendAndConfirmTransaction(connection, transaction, [from]);
	console.log("Signature is ", signature);
	var balanceTO = await getWalletBalance(to.publicKey);
	console.log(`TO balance :   ${balanceTO / LAMPORTS_PER_SOL}  SOL`);
};

async function getWalletBalance(thePublicKey) {
	try {
		// Connect to the Devnet
		const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

		const walletBalance = await connection.getBalance(new PublicKey(thePublicKey));

		return walletBalance;
	} catch (err) {
		console.log(err);
	}
}

transferSol();
