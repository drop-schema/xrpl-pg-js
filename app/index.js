const grpc_client_lib = require('./clients/xrp_grpc_client');
const ws_client_lib = require('./clients/xrp_ws_client');
const pg_client_lib = require('./clients/xrpowl_pg_client');
const fs = require('fs');

const config = require('./config');


const config_id = 'mainnet_s1'
// const config_id = 'mainnet_s2'
// const config_id = 'mainnet_p2plive'

// const grpc_url = config.xrpl['mainnet_p2plive'].grpc.url;
const grpc_url = config.xrpl[config_id].grpc.url;

const max_timeout = 1000000;

const grpc_client = grpc_client_lib.getGrpcClient(grpc_url,isSecure=false);
var grpc_client_promise = grpc_client_lib.waitForGrpcClientReady(grpc_client,timeout=max_timeout)

// do something with the promise when its resolves
grpc_client_promise.then(() => {
    console.log('grpc api ready')
}).catch((error) => {
    throw error
})

// const ws_url = config.xrpl['mainnet_p2plive'].ws.url;
const ws_url = config.xrpl[config_id].ws.url;

const ws_client = ws_client_lib.getWsClient(ws_url,timeout=max_timeout);
var ws_client_promise = ws_client_lib.waitForWsClientReady(ws_client)

ws_client_promise.then(() => {
    console.log('ws api ready')
}).catch((error) => {
    throw error
})


const pg_client = pg_client_lib.getPgClient(config.db);
var pg_client_promise = pg_client_lib.waitForPgClientReady(pg_client)




    // after the postgres client is ready, we can check for the core schema and tables
    // we want to create a promise that resolves after all of these core checks are done
    // because we want the ws and grpc api clients to wait for the database schemas to be ready
    // for the data to be inserted into the database.

    // because this promise is created as a reaction to the pg_client_promise
    // we need to do something to make sure the core_checks_promise is
    // accessible in the global scope
    // to make the core_checks_promise accessible in the global scope
    // we need to create a global variable
    // and assign the core_checks_promise to it
    // so that the core_checks_promise can be accessed in the global scope
    // and the ws and grpc api clients can wait for the core_checks_promise to resolve
    // before they start inserting data into the database

    // this is how to make a promise accessible in the global scope
    // by creating a global variable and assigning the promise to it
 

    const core_checks_promise = new Promise(async (resolve, reject) => {

        pg_client_promise.then(async (client) => {
            console.log('pg ready')
        
        console.log('checking core schema')
        await pg_client_lib.createSchemaIfNotExists(client, 'xrpowl')
        console.log('checking core tables')
        await pg_client_lib.createTableIfNotExists(client, 'xrpowl', 'configs', '../sql/XRPowl/CREATE/XRPowl_configs.sql')
        console.log('checking for data in core tables')
        await pg_client_lib.syncConfig(client, config_id, config)
        
        console.log('checking for data schema')
        await pg_client_lib.createSchemaIfNotExists(client, config_id)


        console.log('checking for data tables')
        await pg_client_lib.createTableIfNotExists(client, config_id, 'grpc_ledgers', '../sql/XRPL/CREATE/grpc_ledgers.template.sql', [config_id])
        // await pg_client_lib.createTableIfNotExists(client, config_id, 'grpc_transactions', '../sql/XRPL/CREATE/grpc_transactions.template.sql')
        await pg_client_lib.createTableIfNotExists(client, config_id, 'ws_server_states', '../sql/XRPL/CREATE/ws_server_states.template.sql', [config_id])

        console.log('finished all core and data checks')
        resolve()
    }).catch((error) => {
        throw error
    })



    // client.release()
    // pg_client.end()
}).catch((error) => {
    throw error
})

// do something when both pg_client_promise and ws_client_promise resolve
Promise.all([pg_client_promise, ws_client_promise]).then(() => {
    console.log('both pg and ws ready')
}).catch((error) => {
    throw error
})

// do something when both pg_client_promise and ws_client_promise resolve
Promise.all([pg_client_promise, ws_client_promise, grpc_client_promise]).then(() => {
    console.log('all pg and ws and grpc ready')
}).catch((error) => {
    throw error
})

Promise.all([pg_client_promise, grpc_client_promise]).then(() => {
    console.log('both pg and grpc ready')
}).catch((error) => {
    throw error
})

Promise.all([ws_client_promise, grpc_client_promise]).then(() => {
    console.log('both grpc and ws ready')
}).catch((error) => {
    throw error
})

Promise.all([core_checks_promise]).then(() => {
    console.log('core checks finished')
}).catch((error) => {
    throw error
})

Promise.all([ws_client_promise]).then(() => {
    console.log('ws api ready')
    ws_client_lib.monitorServerState(ws_client)

}).catch((error) => {
    throw error
})

Promise.all([core_checks_promise, ws_client_promise, grpc_client_promise]).then(() => {
    console.log('all pg (with core checks) and ws and grpc ready')

    setInterval(ledgerDownloadLoop, 80)

    // console.log('getting ledger list for download')
    // pg_client_lib.getLedgerListForDownload(pg_client, config_id).then((ledger_list_rows) => {
    //     console.log('ledger list for download then ... for loop')
    //     // console.log(ledger_list_rows)
    //     for (ledger_list_row of ledger_list_rows) {
    //         // console.log(ledger_list_row['ledger_index'])
    //         const ledger_index = ledger_list_row['ledger_index_to_download']
    //         console.log(ledger_index);
    //         grpc_client_lib.getLedgerDataByIndex(grpc_client, ledger_index, async function(err, response) {
    //             // console.log(response);
    //             response = grpc_client_lib.handleGetLedgerResponse(response)
    //             console.log(response);
    //             pg_client_lib.insertLedgerData(pg_client, config_id, ledger_index, response);
    //             //
    //         }) 
    //     }
    // }).catch((error) => {
    //     console.log(error)
    // })


}).catch((error) => {
    throw error
})


ws_client.on('message', function message(data) {
    const response = data.toString();
    var json_response = JSON.parse(response);
    const id = json_response['id']
    if (id === 2) {
        json_reponse = ws_client_lib.handleServerStateResponse(json_response);
        
        // console.log('🔴 Warning: %s', JSON.stringify(warning));
        // console.log('🟢 Response: %s', JSON.stringify(result['state']));
        const state =  json_response['result']['state'];
        const complete_ledgers = state['complete_ledgers'];
        const validated_index = state['validated_ledger']['seq'];
        const server_ts = (new Date(state['time'])).toISOString();
        const validated_ts = (new Date((state['validated_ledger']['close_time'] + 946684800)*1000)).toISOString();
        pg_client_lib.insertServerState(pg_client, config_id, validated_index, complete_ledgers, server_ts, validated_ts, JSON.stringify(json_response).replace(/'/g,"\\'"));
        // const dt = new Date();
        // const delta = dt - new Date(state['time']);;
        // const ledgerClose = 
        // const delta2 = dt - ledgerClose;
        // console.log('👌 Server Looks OK 📚 %s ⏰ %s Validation Lag: %sms Response Lag: %sms', complete_ledgers, ledgerClose.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }), delta2, delta);
        return json_reponse // dblib.insertServerState(client, validated_index, completed_ledgers, JSON.stringify(json_response));
    }
    // else if (id === 2) {
    //     handleSubscribeTransactionResponseInitial(json_response);
    // }
    // else {
    //     handleSubscribeTransactionResponseFeed(json_response);
    // }
  });


var ledgers_to_download = [];
var ledgers_being_downloaded = 0;
const ledgers_being_downloaded_max = 20;

var ledgerListPending = false;

function ledgerDownloadLoop() {
    if (!ledgerListPending && ledgers_to_download.length <= 0) {
        ledgerListPending = true;
        console.log('downloading ledger list for download')
        pg_client_lib.getLedgerListForDownload(pg_client, config_id).then((ledger_list_rows) => {
            console.log('acquired ledger list for download')
            ledgerListPending = false;
            // append and dedupe ledger_list_rows to ledgers_to_download
            ledgers_to_download = [...new Set([...ledgers_to_download, ...ledger_list_rows.map((ledger_list_row) => ledger_list_row['ledger_index_to_download'])])];
        }).catch((error) => {
            ledgerListPending = false;
            throw error
        })
    }


    // console.log('ledgerDownloadLoop()')
    // console.log('ledgers_being_downloaded: ' + ledgers_being_downloaded)
    // console.log('ledgers_to_download: ' + ledgers_to_download)
    else if (ledgers_being_downloaded <= ledgers_being_downloaded_max) {
        if (ledgers_to_download.length > 0) {
            ledgers_being_downloaded++;
            const ledger_index = ledgers_to_download.shift();
            // console.log('ledger_index: ' + ledger_index)
            // console.log('sending grpc request for ledger_index: ' + ledger_index)
            grpc_client_lib.getLedgerDataByIndex(grpc_client, ledger_index, async function(err, response) {
                try {
                    console.log('grpc response for ledger_index: ' + ledger_index)
                ledgers_being_downloaded--;
                // console.log(response);
                response = grpc_client_lib.handleGetLedgerResponse(err, response)
                // console.log(response);
                pg_client_lib.insertLedgerData(pg_client, config_id, ledger_index, JSON.stringify(response));
                } catch (error) {
                    throw error
                }
                //
            }) 
        }
    }
}
