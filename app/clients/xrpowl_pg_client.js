const pg = require('pg');
const fs = require('fs');
// const SQL = require('sql-template-strings')

function getPgClient(config) {
    // console.log(config)
    return new pg.Pool(config);

}

async function waitForPgClientReady(client) {
    return new Promise((resolve, reject) => {
        client.connect((err, client) => {
            if (err) {
                reject(err);
            }
            resolve(client);
        });
    });
} 

// function to read a sql file from a path
function readSqlFile(path) {
    const sql_string = fs.readFileSync(path, 'utf8')
    // return eval('SQL`' + sql_string + '`');
    // const foo = SQL(sql_string, values);
    // console.log(foo)
    return sql_string
}

// function to read a sql template file from a path
// and replace the placeholders with the values
// assume values is a json object
// and the placeholders are the keys of the json object
// and the values are the values of the json object
// and the templating is done with ES6 template literals
// function readSqlTemplateFile(path) {
//     const sql_template =  fs.readFileSync(path, 'utf8')
//     if (!values) return sql_template;
//     // return sql_template.replace(/\${([^{}]*)}/g, (a, b) => {
//     //     return values[b];
//     // });
// }


// write a function that runs a sql string on a client safely in a transaction
// assume that the sql can be any single statement
// if its a select statement
// return the rows of the result as a json array
// assume that sql might be a template string
// and values might be a json object
// and the templating is done with ES6 template literals
// and the placeholders are the keys of the json object
// and the values are the values of the json object
async function runSql(client, sql, values) {
    await client.query('BEGIN');
    try {
        // console.log(sql)
        // run prepared statement using sql and values array

        // do client side parameter substition, paramaters have synname $1, $2, $3, etc

        // replace the $1, $2, $3, etc with the values in the values array
        // and return the sql string

        sql = sql.replace(/\$([\d+])/g, (a, b) => {
            // console.log(a,b)
            return values[b-1];
        });

        // console.log(sql)

        const results = await client.query(sql);
        await client.query('COMMIT');
        // console.log(results)
        return results;
    }
    catch (e) {
        // if the exception is a primary key violation
        // the log a warning and return
        // else throw the exception
        if (e.code === '23505') {
            console.log('Warning: Primary Key Violation. Tried to insert a row that already exists... Ignoring...');
            await client.query('ROLLBACK');
            return
        }
        await client.query('ROLLBACK');
        throw e;
    }
}

async function runSqlFile(client, path, values) {
    const sql = readSqlFile(path);
    return await runSql(client, sql, values);
}


async function schemaExists(client, schemaName) {
    const sql = readSqlFile('../sql/CORE/SCHEMAS/SELECT/schema_exists.template.sql');
    const results = await runSql(client, sql, [schemaName]);
    return results.rows[0].exists;
}

async function createSchemaIfNotExists(client, schemaName) {
    const schema_exists = await schemaExists(client, schemaName);
    if (!schema_exists) {
        console.log('Schema "%s" does not exist. Creating...', schemaName)
        const sql = readSqlFile('../sql/CORE/SCHEMAS/CREATE/schema.template.sql');
        // console.log(sql,)
        return await runSql(client, sql, [schemaName]);
    } else {
        console.log('Schema "%s" already exists', schemaName)
    }
}

async function tableExists(client, schemaName, tableName) {
    const sql = readSqlFile('../sql/CORE/TABLES/SELECT/table_exists.template.sql');
    const results = await runSql(client, sql, [schemaName, tableName]);
    return results.rows[0].exists;
}

async function createTableIfNotExists(client, schemaName, tableName, createSqlPath, values) {
    const table_exists = await tableExists(client, schemaName, tableName);
    if (!table_exists) {
        console.log('Table "%s"."%s" does not exist. Creating...', schemaName, tableName)
        const sql = readSqlFile(createSqlPath);
        return await runSql(client, sql, values);
    } else {
        console.log('Table "%s"."%s" already exists', schemaName, tableName)
    }
}

async function checkIfConfigInTable(client, config_id) {
    const sql = readSqlFile('../sql/XRPowl/SELECT/XRPowl_config_exists.template.sql');
    const results = await runSql(client, sql, [config_id]);
    return results.rows[0].exists;
}

async function insertConfigIntoTable(client, config_id, config) {
    const sql = readSqlFile('../sql/XRPowl/INSERT/XRPowl_config.template.sql');
    return await runSql(client, sql, [config_id, config]);
}


async function syncConfig(client, config_id, config) {
    const config_exists = await checkIfConfigInTable(client, config_id);
    if (!config_exists) {
        console.log('Config "%s" does not exist in XRPowl.configs. Inserting ...', config_id)
        return await insertConfigIntoTable(client, config_id, config);
    } else {
        console.log('Config "%s" already exists in XRPowl.configs.', config_id)
    }
    await createSchemaIfNotExists(client, config_id);
}

async function  insertServerState(client, config_id, validated_index, complete_ledgers, server_ts, validated_ts, json_data) {
    const sql = readSqlFile('../sql/XRPL/INSERT/ws_server_states.template.sql');
    return await runSql(client, sql, [config_id, validated_index, complete_ledgers, server_ts, validated_ts, json_data]);
}

async function insertLedgerData(client, config_id, ledger_index, json_data) {
    const sql = readSqlFile('../sql/XRPL/INSERT/grpc_ledgers.template.sql');
    return await runSql(client, sql, [config_id, ledger_index, json_data]);
}


async function getLedgerListForDownload(client, config_id) {
    const sql = readSqlFile('../sql/XRPL/SELECT/ws_server_states.template.sql');
    const results = await runSql(client, sql, [config_id]);
    return results.rows;
}




module.exports = {
    getPgClient, waitForPgClientReady, createSchemaIfNotExists, createTableIfNotExists, syncConfig, insertServerState, getLedgerListForDownload, insertLedgerData
};


