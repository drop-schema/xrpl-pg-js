CREATE TABLE IF NOT EXISTS XRPowl.configs
(
    insert_id SERIAL,
    insert_ts timestamp with time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
    config_name TEXT NOT NULL,
    config_json TEXT NOT NULL,
    CONSTRAINT configs_pkey PRIMARY KEY (config_name) 
);

COMMENT ON TABLE XRPowl.configs IS 'XRPowl Configurations. This table is used to store the XRPL WebSocket and gRPC URLs for each configuration. Configuration names are used as the schema name for their respective datasets.';
