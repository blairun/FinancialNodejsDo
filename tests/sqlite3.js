const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const { open } = require('sqlite')

// this is a top-level await
;(async () => {
  // open the database
  const db = await open({
    filename: path.resolve(__dirname, '../finances.sqlite'),
    driver: sqlite3.Database,
  })

  result = await db.all(sql, [], (err, rows) => {
    if (err) {
      throw err
    }
    rows.forEach((row) => {})
  })
  console.log(result)

  // close the database connection
  await db.close()
})()

// // open the database
// let db = new sqlite3.Database('./finances.sqlite');

// // select only accounts with depreciation values
// let sql =
//   `SELECT * FROM AccountMetadata
//   WHERE Cost IS NOT NULL;`

// // select only accounts with depreciation values
// let sql =
//   `SELECT * FROM AccountMetadata`

// let sql =
//   // distinct accountIds
//   `SELECT DISTINCT AccountID FROM Balances
//            ORDER BY AccountID`;

// let sql = `SELECT * FROM Transactions`
// let sql = `SELECT * FROM Balances`

// let sql = // select only balance with the latest date
// `select *
// from Balances b
// inner join (
//     select AccountID, max(RetrievalDate) as Latest
//     from Balances
//     group by AccountID
// ) bm on b.AccountID = bm.AccountID and b.RetrievalDate = bm.Latest`

// let sql = //select latest transactions info
// `select *
// from Transactions t
// inner join (
//     select TransactionID, max(RetrievalDate) as Latest
//     from Transactions
//     group by TransactionID
// ) tm on t.TransactionID = tm.TransactionID and t.RetrievalDate = tm.Latest`

// let sql = // get related data, distributed accross two tables
// `SELECT
//   Balances.AccountID AS AccountID_Balances,
//   AccountMetadata.AccountID AS AccountID_AccountMetadata,
//   Name,
//   FriendlyName,
//   Link
// FROM
//   Balances
// INNER JOIN AccountMetadata ON AccountMetadata.AccountID = Balances.AccountID;`

// let sql = // get related data, distributed accross two tables, uses second table's values for overlapping parameters
// `SELECT *
// FROM
//   Balances
// INNER JOIN AccountMetadata ON AccountMetadata.AccountID = Balances.AccountID;`

// let sql = // get related data, distributed accross two tables, and use Balance table's data for ID
// `select *,
// b.ID AS ID
// from Balances b
// inner join (
//     select AccountID, max(RetrievalDate) as Latest
//     from Balances
//     group by AccountID
// ) bl on b.AccountID = bl.AccountID and b.RetrievalDate = bl.Latest
// INNER JOIN AccountMetadata am ON am.AccountID = b.AccountID;`

// let sql = // select rows with no matching entry in another table
// `SELECT *
// FROM AccountMetadata t1
//     LEFT JOIN Balances t2 ON t1.AccountID = t2.AccountID
// WHERE t2.AccountID IS NULL`

// let sql = // select rows with no matching entry in another table
// `SELECT *
// FROM AccountMetadata t1
//     LEFT JOIN Balances t2 ON t1.AccountID = t2.AccountID
// WHERE t2.AccountID IS NULL`

// Combine results
// query_1
// UNION [ALL]
// query_2
// UNION [ALL]
// query_3
// ...;

// let sql = // combine results for a single list of balances
// `SELECT *
// FROM Balances b
//      INNER JOIN
//      (
//          SELECT AccountID,
//                 max(RetrievalDate) AS Latest
//            FROM Balances
//           GROUP BY AccountID
//      )
//      bl ON b.AccountID = bl.AccountID AND
//            b.RetrievalDate = bl.Latest
//      INNER JOIN
//      AccountMetadata am ON am.AccountID = b.AccountID
// UNION
// SELECT am.ID,
//      am.AccountID,
//      FriendlyName,
//      FriendlyName,
//      Available,
//      BackupAmount,
//      [Limit],
//      BackupType,
//      BackupType,
//      RetrievalDate,
//      am.AccountID,
//      '',
//      am.ID,
//      am.AccountID,
//      Institution,
//      FriendlyName,
//      Link,
//      Notes,
//      BackupAmount,
//      BackupType,
//      [Order]
// FROM AccountMetadata am
//      LEFT JOIN
//      Balances b ON am.AccountID = b.AccountID
// WHERE b.AccountID IS NULL;`

// let sql = // all balance dates
// `SELECT DISTINCT
// RetrievalDate
// from Balances`

// let sql = // select only balance with the latest date
// `select *
// from Balances b
// inner join (
//     select AccountID, max(RetrievalDate)  as Latest
//     from Balances
//     where RetrievalDate = "2020-07-29T16:12:15-07:00"
//     group by AccountID
// ) bm on b.AccountID = bm.AccountID and b.RetrievalDate = bm.Latest`

// let sql = // select rows with no matching entry in another table, only for current selected date
// `SELECT *
// FROM AccountMetadata t1
//     LEFT JOIN
//     (Select *
//       From Balances
//       Where RetrievalDate = ${balancesDate}
//        )
//     t2 ON t1.AccountID = t2.AccountID
// WHERE t2.AccountID IS NULL`

// let sql = // list of pending transactions that have cleared (should not be shown)
// `SELECT *
//   FROM Transactions t1
//        INNER JOIN
//        (
//            SELECT *
//              FROM Transactions
//             WHERE PendingTransactionID IS NOT NULL
//        )
//        t2 ON t1.TransactionID = t2.PendingTransactionID
//  WHERE t1.PendingTransactionID IS NULL;`

//  // Alternative to above (list of pending transactions that have cleared (should be deleted))
//  // This form is condusive to using the delete operator
//  let sql =
//  `SELECT *
//  FROM Transactions
// WHERE TransactionID IN (
//           SELECT t1.TransactionID
//             FROM Transactions t1
//                  INNER JOIN
//                  Transactions t2 ON (t1.TransactionID = t2.PendingTransactionID)
//            WHERE t2.PendingTransactionID IS NOT NULL
//       );`

// let sql = // delete pending transactions that have cleared
// `DELETE FROM Transactions
//       WHERE TransactionID IN (
//     SELECT t1.TransactionID
//       FROM Transactions t1
//            INNER JOIN
//            Transactions t2 ON (t1.TransactionID = t2.PendingTransactionID)
//      WHERE t2.PendingTransactionID IS NOT NULL
// );`

// db.all(sql, [], (err, rows) => {
//   if (err) {
//     throw err;
//   }
//   rows.forEach((row) => {
//     // console.log(row.AccountID);
//     console.log(row);
//   });
// });

// // close the database connection
// db.close();
