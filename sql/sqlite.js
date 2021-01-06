module.exports = {
  balances_current(id) {
    return `SELECT *
    FROM Balances b
         INNER JOIN
         (
             SELECT AccountID,
                    max(RetrievalDate) AS Latest
               FROM Balances
              GROUP BY AccountID
         )
         bl ON b.AccountID = bl.AccountID AND 
               b.RetrievalDate = bl.Latest
         INNER JOIN
         AccountMeta am ON am.AccountID = b.AccountID
    WHERE b.UserID = "${id}";`
  },

  balances_dates(id) {
    return `SELECT DISTINCT RetrievalDate
    FROM Balances
    WHERE UserID = "${id}";`
  },

  balances_all(id) {
    return `SELECT *
    FROM Balances b
         INNER JOIN
         AccountMeta am ON am.AccountID = b.AccountID
    WHERE b.UserID = "${id}";
    ORDER BY b.RetrievalDate;`

    // test how Closed not true affects historical data
    // and am."Closed" is not true
    // limit date range to good values (e.g. starting Aug 20, 2020)
    //  WHERE b.RetrievalDate > "2020-08-20"`;
  },

  balances_date(id) {
    return `SELECT *
      FROM Balances b
           INNER JOIN
           (
               SELECT AccountID,
                      max(RetrievalDate) AS Latest
                 FROM Balances
                WHERE RetrievalDate = ?
                GROUP BY AccountID
           )
           bl ON b.AccountID = bl.AccountID AND 
                 b.RetrievalDate = bl.Latest
           INNER JOIN
           AccountMeta am ON am.AccountID = b.AccountID
     WHERE b.UserID = "${id}";`
    //  where RetrievalDate like '%'
  },

  balances_goals(id) {
    return `SELECT *
    FROM Balances b
         INNER JOIN
         (
             SELECT AccountID,
                    max(RetrievalDate) AS Latest
               FROM Balances
              GROUP BY AccountID
         )
         bl ON b.AccountID = bl.AccountID AND 
               b.RetrievalDate = bl.Latest
         INNER JOIN
         AccountMeta am ON am.AccountID = b.AccountID
         INNER JOIN
         Goals g ON g.id = am.GoalID
    WHERE g.UserID = "${id}";`
  },

  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////

  transactions_current(id) {
    return `SELECT *
    FROM Transactions t
         INNER JOIN
         (
             SELECT TransactionID,
                    max(RetrievalDate) AS Latest
               FROM Transactions
              GROUP BY TransactionID
         )
         tm ON t.TransactionID = tm.TransactionID AND 
               t.RetrievalDate = tm.Latest
    WHERE t.UserID = "${id}" AND 
          t.Hide IS NULL
   ORDER BY t.TransactionDate DESC;`
  },

  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////

  // used in PlaidsCtl
  metas(id) {
    return `SELECT *
    FROM AccountMeta
    WHERE UserID = "${id}" 
    ORDER BY LOWER(Institution);`
    // AND Closed IS NULL
  },

  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////

  // used in updateBalances
  assetDepreciation1() {
    return `SELECT * FROM AccountMeta 
            WHERE Cost > 0;`
  },

  assetDepreciation2(newValue, id) {
    return `UPDATE AccountMeta 
    SET BackupAmount = ${newValue}
    WHERE id = ${id}`
  },

  insertOrphans(balancesDate, userId) {
    return `SELECT *,
      t1.id AS id,
      t1.UserID as UserID,
      t1.AccountID as AccountID
      FROM AccountMeta t1
      LEFT JOIN 
      (SELECT *
        From Balances
            WHERE RetrievalDate = "${balancesDate}"
            )
            t2 ON t1.AccountID = t2.AccountID
            WHERE t2.AccountID IS NULL AND t1.Closed IS NOT TRUE AND t1.UserID = "${userId}"`
  },

  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////

  // used in updateTransactions
  cleanup(userId) {
    return `DELETE FROM Transactions
    WHERE TransactionID IN (
        SELECT t1.TransactionID
        FROM Transactions t1
        INNER JOIN
        Transactions t2 ON (t1.TransactionID = t2.PendingTransactionID) 
        WHERE t2.PendingTransactionID IS NOT NULL AND t2.UserID = ${userId})`
  },
}
