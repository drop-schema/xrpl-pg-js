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

const pbuf_api_v1 = grpc.loadPackageDefinition(packageDefinition).org.xrpl.rpc.v1;
const client = new pbuf_api_v1.XRPLedgerAPIService('0.0.0.0:50051', grpc.credentials.createInsecure());


function handleGetLedgerResponse(err,response) {
    const header = codec.decodeLedgerData(response.ledger_header.toString('hex'))
    var tx_list = []
    for (tx of response.transactions_list.transactions)
        tx_list.push(codec.decode(tx.transaction_blob.toString('hex')))
    response.ledger_header = header
    response.transactions_list.transactions = tx_list
    console.log(JSON.stringify(response, null, ' '))
}

client.GetLedger({ledger: {ledger: 1}, transactions: true, expand: true, get_objects: false}, handleGetLedgerResponse);
