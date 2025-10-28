WITH top_heights AS (
  SELECT block_height
  FROM test_txs
  GROUP BY block_height
  ORDER BY block_height DESC
  LIMIT $1
)
SELECT t.*
FROM test_txs AS t
JOIN top_heights h USING (block_height)
ORDER BY t.block_height DESC, t.id;
