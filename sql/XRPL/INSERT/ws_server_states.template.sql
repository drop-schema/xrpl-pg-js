INSERT INTO $1.ws_server_states (
    validated_index,
    complete_ledgers,
    server_ts,
    validated_ts,
    server_json
) 
VALUES ($2, '$3', '$4', '$5', '$6');
