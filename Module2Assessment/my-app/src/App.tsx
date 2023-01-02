import "./App.css";
// added some imports
import { Connection, PublicKey, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction, clusterApiUrl } from "@solana/web3.js";

import { useEffect, useState } from "react";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";

// added this too because of an error that i got
import * as buffer from "buffer";
import { wait } from "@testing-library/user-event/dist/utils";
window.Buffer = buffer.Buffer;

// create types
type DisplayEncoding = "utf8" | "hex";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";
type PhantomRequestMethod = "connect" | "disconnect" | "signTransaction" | "signAllTransactions" | "signMessage";

interface ConnectOpts {
	onlyIfTrusted: boolean;
}

// create a provider interface (hint: think of this as an object) to store the Phantom Provider
interface PhantomProvider {
	publicKey: PublicKey | null;
	isConnected: boolean | null;
	signTransaction: (transaction: Transaction) => Promise<Transaction>;
	signAllTransactions: (transactions: Transaction[]) => Promise<Transaction[]>;
	signMessage: (message: Uint8Array | string, display?: DisplayEncoding) => Promise<any>;
	connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
	disconnect: () => Promise<void>;
	on: (event: PhantomEvent, handler: (args: any) => void) => void;
	request: (method: PhantomRequestMethod, params: any) => Promise<unknown>;
}

/**
 * @description gets Phantom provider, if it exists
 */

const getProvider = (): PhantomProvider | undefined => {
	if ("solana" in window) {
		// @ts-ignore
		const provider = window.solana as any;
		if (provider.isPhantom) return provider as PhantomProvider;
	}
};

function App() {
	// create state variable for the provider
	const [provider, setProvider] = useState<PhantomProvider | undefined>(undefined);

	// create state variable for the wallet key
	const [walletKey, setWalletKey] = useState<PhantomProvider | undefined>(undefined);

	// NEW
	// create state variable for the wallet that is going to be created when the button is pressed
	const [newWallet, setNewWallet] = useState<Keypair | undefined>(undefined);
	// im going to set this variable this after the airdrop is finished
	const [airdropCompleted, setairDropCompleted] = useState<boolean>(false);
	// This will be set to the link of the transaction on solana explorer
	const [link, setLink] = useState<string>("");

	// this is the function that runs whenever the component updates (e.g. render, refresh)
	useEffect(() => {
		const provider = getProvider();

		// if the phantom provider exists, set this as the provider
		if (provider) setProvider(provider);
		else setProvider(undefined);
	}, []);

	// this will be called even at the first render
	// only call airdropSol function after the wallet has been modified
	useEffect(() => {
		airdropSol().catch(console.error);
		//setairDropCompleted(false);
		//wait(1000);
		//airdropSol().catch(console.error); // some more sol for fees
	}, [newWallet]);

	/**
	 * @description  This function is used to airdrop 2 sol into the newly created wallet
	 * It is called after the wallet variable has been changed (useEfect)
	 */
	const airdropSol = async () => {
		if (newWallet !== undefined) {
			try {
				const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
				var airDropSignature = await connection.requestAirdrop(new PublicKey(newWallet.publicKey), 2 * LAMPORTS_PER_SOL);
				let latestBlockHash = await connection.getLatestBlockhash();

				await connection.confirmTransaction({
					blockhash: latestBlockHash.blockhash,
					lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
					signature: airDropSignature,
				});

				// set this variable so we know that step 1 has been succesfully finished so now we chan show the connect button
				setairDropCompleted(true);
				console.log("Airdrop completed for the new account");
			} catch (err) {
				alert(err);
			}
		}
	};

	/**
	 * @description prompts user to connect wallet if it exists.
	 * This function is called when the connect wallet button is clicked
	 */
	const connectWallet = async () => {
		// @ts-ignore
		const { solana } = window;
		console.log(newWallet);
		// checks if phantom wallet exists
		if (solana) {
			try {
				// connects wallet and returns response which includes the wallet public key
				const response = await solana.connect();

				console.log("wallet account ", response.publicKey.toString());
				// update walletKey to be the public key
				setWalletKey(response.publicKey.toString());
			} catch (err) {
				// { code: 4001, message: 'User rejected the request.' }
			}
		}
	};

	// This function is can used after a connection to the phantom wallet by pressing the disconnect button
	const disconnectWallet = () => {
		if (walletKey !== undefined) {
			try {
				const response = walletKey.disconnect; // its a Promise<void> or an error;
				if (response !== undefined) {
					throw new Error("Something went wrong when disconnecting");
				}
				setWalletKey(undefined);
			} catch (err) {
				console.log(err);
			}
		} else {
			<p>Something went wrong - no wallet Key</p>;
		}
	};

	// the easiest way would be to just put airdrop sol body here
	// but i think is better practice to devide this two fucntions
	const createAccount = () => {
		setNewWallet(Keypair.generate());
		console.log(newWallet);
	};

	/**
	 * @description Transfers 1.995 sol from the newly created wallet to the phantom wallet which has been connected at step 2
	 * This function is used when the Transfer to new wallet button is pressed
	 */
	const transferSOL = async () => {
		await airdropSol();

		console.log("Started transfer");
		const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
		try {
			if (newWallet !== undefined && walletKey) {
				var phantomWalletKey = new PublicKey(walletKey);
				var transaction = new Transaction().add(
					SystemProgram.transfer({
						fromPubkey: newWallet.publicKey,
						toPubkey: phantomWalletKey,
						lamports: 2 * LAMPORTS_PER_SOL, // we need some sol for fees thats why i dont send exactly 2 sol
					})
				);

				// Sign transaction
				var signature = await sendAndConfirmTransaction(connection, transaction, [newWallet]);
				console.log("Signature is ", signature);

				setLink("https://explorer.solana.com/tx/" + signature + "?cluster=devnet");
			} else {
				alert("One of the wallets has not been initialized");
			}
		} catch (err) {
			alert(err);
		}
	};

	// HTML code for the app
	return (
		<div className="App">
			<div className="menu-bar" style={{ display: "flex" }}>
				{walletKey && (
					<button
						style={{
							marginLeft: "80%",
							fontSize: "12px",
							padding: "15px",
							fontWeight: "bold",
							borderRadius: "5px",
							alignSelf: "center",
							color: "red",
						}}
						onClick={disconnectWallet}
					>
						Disconnect
					</button>
				)}
			</div>

			<header className="App-header">
				{!airdropCompleted && (
					<button
						style={{
							fontSize: "16px",
							padding: "15px",
							fontWeight: "bold",
							borderRadius: "5px",
							alignSelf: "center",
							backgroundColor: "grey",
						}}
						onClick={createAccount}
					>
						Create a new Solana account
					</button>
				)}
				{newWallet && !airdropCompleted && <h4>Requesting 2 SOL. It might take a minute...</h4>}
				{provider && !walletKey && airdropCompleted && <h2>Connect to Phantom Wallet</h2> && (
					<button
						style={{
							fontSize: "16px",
							padding: "15px",
							fontWeight: "bold",
							borderRadius: "5px",
							alignSelf: "center",
						}}
						onClick={connectWallet}
					>
						Connect to Phantom Wallet
					</button>
				)}

				{provider && walletKey && <p>Connected to account : {walletKey.toString()} </p> && (
					<button
						style={{
							fontSize: "16px",
							padding: "15px",
							fontWeight: "bold",
							borderRadius: "5px",
							alignSelf: "center",
							backgroundColor: "#645f5f",
						}}
						onClick={transferSOL}
					>
						Transfer to new wallet
					</button>
				)}
				{walletKey && link !== "" && (
					<a href={link} target="_blank" style={{ color: "white" }}>
						Check your tranzaction here!
					</a>
				)}
				{!provider && (
					<p>
						No provider found. Install <a href="https://phantom.app/">Phantom Browser extension</a>
					</p>
				)}
			</header>
		</div>
	);
}

export default App;
