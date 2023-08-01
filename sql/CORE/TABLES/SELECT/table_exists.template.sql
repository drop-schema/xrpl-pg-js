SELECT EXISTS (
    SELECT 1
    FROM   information_schema.tables
    where table_schema = '$1'
    and table_name = '$2'
);
