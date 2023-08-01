const { Pool } = require('pg');
const config = require('../config');
const pool = new Pool(config.db);
 
async function getClient(config) {
    return await pool.connect()
}

async function insertServerState(client, jsonString) {
    try {
        // console.log('Attempting to Insert Server State to Postgres')
        await client.query('BEGIN')
        const insertServerStates = 'INSERT INTO mainnet.ws_server_states(json_data) VALUES ($1)'
        const insertServerStatesValues = [jsonString]
        await client.query(insertServerStates, insertServerStatesValues)
        await client.query('COMMIT')
        // console.log('Successfully Inserted Server State to Postgres')
      } catch (e) {
        console.log(e)
        await client.query('ROLLBACK')
        // console.log('Failed to Insert Server State to Postgres')
        throw e
      } 
}

// async function insertSubscribedTransactions(client, jsonString) {
//     try {
//         // console.log('Attempting to Insert Subscribed Transactions to Postgres')
//         await client.query('BEGIN')
//         const insertSubscribedTransactions = 'INSERT INTO subscribed_transactions(json_string) VALUES ($1)'
//         const insertSubscribedTransactionsValues = [jsonString]
//         await client.query(insertSubscribedTransactions, insertSubscribedTransactionsValues)
//         await client.query('COMMIT')
//         // console.log('Successfully Inserted Subscribed Transactions to Postgres')
//       } catch (e) {
//         await client.query('ROLLBACK')
//         // console.log('Failed to Insert Subscribed Transactions to Postgres')
//         throw e
//       } 
// }
  
module.exports = {
    getClient, insertServerState//, insertSubscribedTransactions
};
