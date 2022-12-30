Solana Module 2: Lesson 4 of 4 Challenge

Observations on the ways Transactions are created in the Break program vs Hello World program:

1. Unlike the Hello World program, the Break program defines a CreateTransaction custom function
that accepts a set of parameters as defined in the custom TransactionMessage interface and
utilises the Transaction functionality from Solana/web3.js to create transaction.

2. While Hello World program used Greeting Account size to calculate Transaction cost, the Break
program requests 100 Units from ComputeBudgetProgram (defined in Solana/web3.js) for setting
the required Transaction Priority and calculates the additional fee in Lamports 
(on top of  the base fee ie 5,000 Lamports) by multiplying the input parameter ComputeUnitCost 
(in micro Lamports) by number of Units ie 100.

3. Break program also adds an instruction to the Transaction with the Instruction data based on
the input bitId value, whereas in Hello world program, the Instruction data was ignored since
the TransactionInstruction was used to log the Hello greetings.

4. In the Hello World program, the greetedPubKey is used as keys parameter for creating
TransactionInstrunction whereas in Break program, both the programDataAccount & 
extraWriteAccount are passed as keys for adding the Instruction to the Transaction.

5. Further, in Break program, the most recent Blockhash is used for creating Transaction,
and the Transaction is signed using feeAccountSecretKey.
The Transactions can also be run in parallel as well as retried after a specified time
duration based on the configuration parameters set.
 
