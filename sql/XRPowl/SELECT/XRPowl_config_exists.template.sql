select exists(
    select 1 from XRPowl.configs where config_name = '$1'
);
