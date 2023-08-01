-- -- select all columns by name

-- with data_ as (
-- select
--     -- insert_id ,
--     -- insert_ts ,
--     validated_index,
--     complete_ledgers,
--     server_ts,
--     validated_ts,
--     server_json
-- from
-- mainnet_s2.ws_server_states
-- order by 
-- insert_ts desc
-- limit 1
-- )


-- -- split complete_ledgers string by comma delimeter into array
-- select ledger_index as ledger_index_to_download from (
-- select generate_series(r_min,r_max,1) ledger_index, r_min, r_max from (
-- select
-- --  complete_ledgers,
--  complete_ledgers_comma_split as r,
--  cast(complete_ledgers_dash_split[1] as bigint) as r_min,
--  cast(case when array_length(complete_ledgers_dash_split, 1) = 2
--  	then complete_ledgers_dash_split[2] else complete_ledgers_dash_split[1] end as bigint) as r_max
--  from data_,
--  unnest(string_to_array(complete_ledgers, ',')) as complete_ledgers_comma_split,
--  string_to_array(complete_ledgers_comma_split, '-') as complete_ledgers_dash_split
-- 	) tmp 
-- 	)tmp2
-- 	where ledger_index not in (select ledger_index from mainnet_s2.grpc_ledgers)
-- 	order by (abs(r_min - ledger_index))^2 + (abs(r_max - ledger_index))^2 desc, ledger_index desc
-- 	limit 10000



with data_ as (
select
    -- insert_id ,
    -- insert_ts ,
    validated_index,
    complete_ledgers,
    server_ts,
    validated_ts,
    server_json
from
mainnet_s2.ws_server_states
order by 
insert_ts desc
limit 1
),

loaded as (
	select l1, case when lead(l2) over (order by l1) is null then l2+1 else l2 end l2 from (
select ledger_index as l1, lead(lag_index) over (order by ledger_index) as l2 from (
select ledger_index,
	lag(ledger_index) over (order by ledger_index) as lag_index,
	lead(ledger_index) over (order by ledger_index) as lead_index,
ledger_index - lag(ledger_index) over (order by ledger_index) as delta from mainnet_s2.grpc_ledgers 
) tmp where delta != 1 or lag_index is null or lead_index is null
) tmp2 where l2 is not null
),

validated as (

select
--  complete_ledgers,
 complete_ledgers_comma_split as r,
 cast(complete_ledgers_dash_split[1] as bigint) as r_min,
 cast(case when array_length(complete_ledgers_dash_split, 1) = 2
 	then complete_ledgers_dash_split[2] else complete_ledgers_dash_split[1] end as bigint) as r_max
 from data_,
 unnest(string_to_array(complete_ledgers, ',')) as complete_ledgers_comma_split,
 string_to_array(complete_ledgers_comma_split, '-') as complete_ledgers_dash_split
),


foo as (
select min(l2)+1 as inner_dl_min, max(l1)-1 inner_dl_max, max(l2)+1 as outer_dl_max from loaded
	)
	select index_to_download as ledger_index_to_download from (
	select
	generate_series(inner_dl_min,inner_dl_max,1)index_to_download,
		r_min, r_max
-- 	generate_series(outer_dl_max,r_max,1) 
	
	from foo, validated
	union all
	select
-- 	generate_series(inner_dl_min,inner_dl_max,1)index_to_download
	generate_series(outer_dl_max,r_max,1),
		r_min, r_max
	
	from foo, validated	
		) tmp order by (abs(r_min - index_to_download))^2 + (abs(r_max - index_to_download))^2 desc, index_to_download desc
	limit 50000
