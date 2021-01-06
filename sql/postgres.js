// TODO where possible, widdle these down by using sequelize

module.exports = {
  balances_current(id) {
    return `select
        *
      from
        public."Balances" as b
      inner join (
        select
          i."AccountID",
          max(i."RetrievalDate") as "Latest"
        from
          public."Balances" as i
        group by
          i."AccountID") as boo on
        b."AccountID" = boo."AccountID"
        and b."RetrievalDate" = boo."Latest"
      inner join public."AccountMeta" as am on
        am."AccountID" = b."AccountID"
        and am."Closed" is not true
      where
        b."UserID" = ${id}`
  },

  balances_dates(id) {
    return `select
        distinct b."RetrievalDate"
      from
        public."Balances" b 
      where
        b."UserID" = ${id}`
  },

  balances_all(id) {
    return `select
        *
      from
        public."Balances" b
      inner join public."AccountMeta" am on
        am."AccountID" = b."AccountID"
      where
        b."UserID" = ${id}
      order by
        b."RetrievalDate"`

    // test how Closed not true affects historical data
    // and am."Closed" is not true
    // limit date range to good values (e.g. starting Aug 20, 2020)
    //  WHERE b.RetrievalDate > "2020-08-20"`;
  },

  balances_date(id) {
    return `select
          *
        from
          public."Balances" as b
        inner join (
          select
            i."AccountID",
            max(i."RetrievalDate") as "Latest"
          from
            public."Balances" as i
          where
            i."RetrievalDate" = ?
          group by
            i."AccountID") as boo on
          b."AccountID" = boo."AccountID"
          and b."RetrievalDate" = boo."Latest"
        inner join public."AccountMeta" as am on
          am."AccountID" = b."AccountID"
        where
          b."UserID" = ${id}`
    //  where RetrievalDate like '%'
  },

  balances_goals(id) {
    return `select
        *
      from
        public."Balances" as b
      inner join (
        select
          i."AccountID",
          max(i."RetrievalDate") as "Latest"
        from
          public."Balances" as i
        group by
          i."AccountID") as boo on
        b."AccountID" = boo."AccountID"
        and b."RetrievalDate" = boo."Latest"
      inner join public."AccountMeta" as am on
        am."AccountID" = b."AccountID"
      inner join public."Goals" g on
        g."id" = am."GoalID"
      where
        b."UserID" = ${id}`
  },

  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////

  transactions_current(id) {
    return `select
    *
    from
    public."Transactions" t
      inner join (
        select
        i."TransactionID",
        max(i."RetrievalDate") as "Latest"
        from
        public."Transactions" i
        group by
        i."TransactionID" ) as tm on
        t."TransactionID" = tm."TransactionID"
        and t."RetrievalDate" = tm."Latest"
        where
        t."UserID" = ${id}
        and t."Hide" is null
        order by
        t."TransactionDate" desc`
  },

  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////

  // used in PlaidsCtl
  metas(id) {
    return `select
    *
    from
    public."AccountMeta" as am
    where
    am."UserID" = ${id}
    order by
    LOWER(am."Institution")`
    // and am."Closed" is null`
  },

  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////

  // used in updateBalances
  assetDepreciation1() {
    return `select
    *
    from
    public."AccountMeta" am
    where
    am."Cost" > 0`
  },

  assetDepreciation2(newValue, id) {
    return `update
    public."AccountMeta"
    set
    "BackupAmount" = ${newValue}
      where
      id = ${id}`
  },

  insertOrphans(balancesDate, userId) {
    return `select
      *,
      am.id as id,
      am."UserID" as "UserID",
      am."AccountID" as "AccountID"
      from
      public."AccountMeta" as am
      left join (
        select
        *
        from
        public."Balances" as i
        where
        i."RetrievalDate" = '${balancesDate}') as b on
        am."AccountID" = b."AccountID"
        where
        b."AccountID" is null
        and am."Closed" is not true
        and am."UserID" = ${userId}`
  },

  /////////////////////////////////////////////
  /////////////////////////////////////////////
  /////////////////////////////////////////////

  // used in updateTransactions
  cleanup(userId) {
    return `delete
      from
        public."Transactions" a
      where
        a."TransactionID" in (
        select
          t."TransactionID"
        from
          public."Transactions" t
        inner join public."Transactions" tt on
          (t."TransactionID" = tt."PendingTransactionID")
        where
          tt."PendingTransactionID" is not null
          and tt."UserID" = ${userId})`
  },
}
