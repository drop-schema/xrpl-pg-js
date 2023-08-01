const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const codec = require('ripple-binary-codec')

const PROTO_PATH = __dirname +'/proto/org/xrpl/rpc/v1/xrp_ledger.proto';
const packageDefinition = protoLoader.loadSync(
    PROTO_PATH, { 
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
});

function getGrpcClient(url, isSecure = false) {
    // console.log(url)
    const pbuf_api_v1 = grpc.loadPackageDefinition(packageDefinition).org.xrpl.rpc.v1;
    // if (isSecure)
    //     return new pbuf_api_v1.XRPLedgerAPIService(url, grpc.credentials.createSsl());
    return new pbuf_api_v1.XRPLedgerAPIService(url, grpc.credentials.createInsecure());
}

async function waitForGrpcClientReady(client, timeout = 1000, retry = 0, retry_limit = 10) {
    return new Promise((resolve, reject) => {
        client.waitForReady(Date.now() + timeout, (err) => {
            if (err) {
                if (retry > 0 && retry <= retry_limit) {
                    waitForGrpcClientReady(client, timeout, retry + 1, retry_limit)
                } else {
                    reject(err);
                } 
            } else {
                resolve();
            }
        });
    });
}


function handleGetLedgerResponse(err,response) {
    if (err)
        throw err
    const header = codec.decodeLedgerData(response.ledger_header.toString('hex'))
    response.ledger_header = header
    
    var tx_list = []
    if (response.transactions_list && response.transactions_list.transactions) {
    for (tx of response.transactions_list.transactions)
        tx_list.push(codec.decode(tx.transaction_blob.toString('hex')))
    
    response.transactions_list.transactions = tx_list
    // console.log(header)

    }
    return response
    // dblib.insertTransactions(dbclient, JSON.stringify(response));

    // sequence += 1;
    // setTimeout(function() {
    // grpc_client.GetLedger({ledger: {sequence: sequence}, transactions: true, expand: true, get_objects: false}, handleGetLedgerResponse);
    // }, 1000)
                                   //78779000

}

async function getLedgerDataByIndex(client, ledger_index, callback) {
    return await client.GetLedger({ledger: {sequence: ledger_index}, transactions: true, expand: true, get_objects: false}, callback);
}

  
module.exports = {
    getGrpcClient, waitForGrpcClientReady, handleGetLedgerResponse, getLedgerDataByIndex
};
