// Import Solana web3 functionalities
const { Connection, PublicKey, clusterApiUrl, Keypair, LAMPORTS_PER_SOL } = require("@solana/web3.js");

// Create a new keypair
const newPair = new Keypair();

// Exact the public and private key from the keypair
const publicKey = new PublicKey(newPair._keypair.publicKey).toString();
const privateKey = newPair._keypair.secretKey;

// Connect to the Devnet
const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

console.log("Public Key of the generated keypair", publicKey);

// Get the wallet balance from a given private key
const getWalletBalance = async (thePublicKey) => {
	try {
		// Connect to the Devnet
		const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
		console.log("Connection object is:", connection);

		// Make a wallet (keypair) from privateKey and get its balance
		const myWallet = await Keypair.fromSecretKey(privateKey);
		const walletBalance = await connection.getBalance(new PublicKey(thePublicKey));
		console.log(`Wallet balance: ${parseInt(walletBalance) / LAMPORTS_PER_SOL} SOL`);
	} catch (err) {
		console.log(err);
	}
};

const airDropSol = async (publicKeyAddress) => {
	try {
		// Connect to the Devnet and make a wallet from privateKey
		const connection = new Connection(clusterApiUrl("devnet"), "confirmed");

		// Request airdrop of 2 SOL to the wallet
		console.log("Airdropping some SOL to my wallet!");
		let theKey = new PublicKey(publicKeyAddress);
		const fromAirDropSignature = await connection.requestAirdrop(theKey, 2 * LAMPORTS_PER_SOL);
		await connection.confirmTransaction(fromAirDropSignature);
	} catch (err) {
		console.log(err);
	}
};

var arguments = process.argv;

// Show the wallet balance before and after airdropping SOL
const mainFunction = async () => {
	const thePublicKey = arguments[2];

	await getWalletBalance(thePublicKey);
	await airDropSol(thePublicKey);
	await getWalletBalance(thePublicKey);

	console.log(`2 sol airdropped to ${thePublicKey}`);
};

mainFunction();
