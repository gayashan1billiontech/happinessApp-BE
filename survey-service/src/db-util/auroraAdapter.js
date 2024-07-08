
import { helpers } from '../../libs';

const { AURORA__DB_CLUSTER_ID, ENV_ID, REGION } = process.env;

const { utilsHelper } = helpers;
let dataApi = null;

/**
 * This will return a dataApiClient that has been initialized and
 * if there's not, a new one will be created.
 */
const getDataApi = () => {
  if (dataApi) return dataApi;

  return (dataApi = require('data-api-client')({
    secretArn: 'AURORA_DB_CON_CREDENTIALS_ARN',
    resourceArn: `arn:aws:rds:${REGION}:${ENV_ID}:cluster:${AURORA__DB_CLUSTER_ID}`,
    database: 'AURORA_DB',
  }));
};

const criteria = {
  eq: (param) => {
    const key = Object.values(param)[0];
    return `${key} = :${key}`;
  },
  lt: (param) => {
    const key = Object.values(param)[0];
    return `${key} < :${key}`;
  },
  gt: (param) => {
    const key = Object.values(param)[0];
    return `${key} > :${key}`;
  },
  lte: (param) => {
    const key = Object.values(param);
    return `${key} <= :${key}`;
  },
  gte: (param) => {
    const key = Object.values(param)[0];
    return `${key} >= :${key}`;
  },
  ne: (param) => {
    const key = Object.values(param)[0];
    return `${key} <> :${key}`;
  },
  in: (param) => {
    const key = Object.values(param)[0];
    return `${key} IN (:${key})`;
  },
};

const criteriaBuilder = {
  sql: '',
  and(...criteria) {
    let andGen = criteria.map((c) => `( ${c} )`).join(' AND ');

    criteria.length > 1 ? (andGen = `( ${andGen} )`) : andGen;
    console.log(this.sql === '');
    this.sql ? (this.sql += ` AND ${andGen} `) : (this.sql += andGen);
    return this;
  },
  or(...criteria) {
    let orGen = criteria.map((c) => `( ${c} )`).join(' OR ');

    criteria.length > 1 ? (orGen = `( ${orGen} )`) : orGen;
    this.sql ? (this.sql += ` OR ${orGen} `) : (this.sql += orGen);
    return this;
  },
  build() {
    return this.sql;
  },
};

// generate INSERT query and return string sql query and query parameters
const generateInsertQuery = (tableName, data) => {
  if (typeof data === 'object' && data !== null) {
    // const now = utilsHelper.convertDate(utilsHelper.getDateTime(), 'MM/DD/YYYY, h:m:s A', 'YYYY-MM-DD HH:MM:SS');
    // data.createdAt = now;
    // data.updatedAt = now;

    data = Object.entries(data).reduce(
      (a, [k, v]) =>
        v === undefined
          ? a
          : (() => {
              a[k] = v;
              return a;
            })(),
      {}
    );
  }

  const sql = `INSERT INTO ${tableName} (${[...Object.keys(data)]}) VALUES (${[
    ...Object.keys(data).map((e) => ':'.concat(e)),
  ]})`;
  console.info(sql);
  return { sql, data };
};

// generate Batch INSERT query and return string sql query and query parameters
const generateBulkInsertQuery = (tableName, columns, data) => {
  /* const now = utilsHelper.convertDate(
    utilsHelper.getDateTime(),
    "MM/DD/YYYY, h:m:s A",
    "YYYY-MM-DD HH:MM:SS"
  );
  columns.createdAt = now;
  columns.updatedAt = now; */

  columns = columns.filter((element) => element !== undefined);

  const sql = `INSERT INTO ${tableName} (${[...columns]}) VALUES (${[...columns.map((e) => ':'.concat(e))]})`;
  console.info(sql);
  return { sql, data };
};

/**
 * Generate INSERT SQL query!
 * @param  {Object} tableName Table Name
 * @param  {Object} insertData   Object that contains the update fields and values
 */
const _insert = async (tableName, insertData) => {
  const { sql, data } = generateInsertQuery(tableName, insertData);
  return await getDataApi().query(sql, data);
};

/**
 * Generate Batch INSERT SQL query!
 * @param  {Object} tableName Table Name
 * @param  {Object} columns Column Names as object
 * @param  {Object} insertData   Object that contains the update fields and values
 */
const _insertBulk = async (tableName, columns, insertData) => {
  const { sql, data } = generateBulkInsertQuery(tableName, columns, insertData);
  return await getDataApi().query(sql, data);
};

// generate insert quey and return string sql query and query parameters
const generateUpdateQuery = (tableName, updateData, criteria, criteriaData) => {
  const now = utilsHelper.convertDate(utilsHelper.getDateTime(), 'MM/DD/YYYY, h:m:s A', 'YYYY-MM-DD HH:MM:SS');
  updateData.updatedAt = now;
  updateData = Object.entries(updateData).reduce(
    (a, [k, v]) =>
      v === undefined
        ? a
        : (() => {
            a[k] = v;
            return a;
          })(),
    {}
  );

  const sql = `UPDATE ${tableName} SET ${[
    ...Object.keys(updateData).map((key) => key.concat(` = :${key} `)),
  ]} WHERE ${criteria}`;

  console.log(sql);
  return { sql, data: { ...updateData, ...criteriaData } };
};

/**
 * Generate UPDATE SQL query!
 * @param  {Object} tableName Table Name
 * @param  {Object} data   Object that contains the update fields and values
 * @param  {Object} conditions   Object that contains the WHERE clause fields and values
 */
const _update = async (tableName, updateData, criteria, criteriaData) => {
  const { sql, data } = generateUpdateQuery(tableName, updateData, criteria, criteriaData);
  return await getDataApi().query(sql, data);
};

// generate DELETE query and return string sql query and query parameters
const generateDeleteQuery = (tableName, criteria, criteriaData) => {
  const sql = `DELETE FROM ${tableName} WHERE ${criteria}`;
  console.log(sql);
  return { sql, data: criteriaData };
};

/**
 * Generate DELETE SQL query!
 * @param  {Object} tableName Table Name
 * @param  {Object} conditions   Object that contains the WHERE clause fields and values
 */
const _delete = async (tableName, criteria, criteriaData) => {
  const { sql, data } = generateDeleteQuery(tableName, criteria, criteriaData);
  return await getDataApi().query(sql, data);
};

const getChunkedResult = async (sql, data) => {
  sql = sql.replace(/\n/g, '');

  const getCount = async (sql, data) => {
    sql = sql.replace(/(SELECT|select)(.+?)(?= FROM| from)/, '$1 count(*)');
    console.log('-- count sql --', sql);
    // const count = (await getDataApi().query(sql, data)).records[0]['count(*)'];
    const result = await getDataApi().query(sql, data);

    let count = 0;
    if (result.records.length) {
      count = result.records[0]['count(*)'];
    }
    return count;
  };

  if (
    ['SELECT', 'select'].includes(
      sql
        .split(' ')
        .filter((x) => x !== '')
        .shift()
    )
  ) {
    const LIMIT_SIZE = 1000;
    const result = { records: [] };

    const count = await getCount(sql, data);
    const roundedCount = Math.round(count / LIMIT_SIZE) + 1;

    const promises = [];
    // eslint-disable-next-line no-plusplus
    for (let x = 0; x < roundedCount; x++) {
      const newSql = `${sql} LIMIT ${x * LIMIT_SIZE},${LIMIT_SIZE}`;
      console.log('-- new sql --', newSql);
      promises.push(getDataApi().query(newSql, data));
    }

    const promiseResultArr = await Promise.all(promises);

    // eslint-disable-next-line no-restricted-syntax
    for (const r of promiseResultArr) {
      result.records = result.records.concat(r.records);
    }

    console.log('_query: ', result);
    return result;
  }

  console.log('sql: ', sql);
  const result = await getDataApi().query(sql, data);
  console.log('_query: ', result);
  return result;
};

// generate SELECT query and return string sql query and query parameters
const generateSelectQuery = (tableName, conditions, conditionsData, returnFields = { '*': '' }) => {
  const sql = `SELECT ${[...Object.values(returnFields)]} FROM ${tableName} WHERE ${conditions}`;
  console.log(sql);
  return { sql, data: conditionsData };
};

/**
 * Generate SELECT SQL query!
 * @param  {Object} tableName Table Name
 * @param  {Object} conditions   Object that contains the WHERE clause fields
 * @param  {Object} conditionsData   Object that contains the WHERE clause fields values
 * @param  {Object} returnFields column names that you want to return | default value '*'
 */
const _select = async (tableName, conditions, conditionsData, returnFields) => {
  const { sql, data } = generateSelectQuery(tableName, conditions, conditionsData, returnFields);
  return await getChunkedResult(sql, data);
};

// TODO
const _query = async (sql, data) => await getChunkedResult(sql, data);

const _transactions = {
  queryMap: [],
  insert(tableName, data) {
    this.queryMap.push(generateInsertQuery(tableName, data));
    return this;
  },
  update(tableName, updateData, criteria, criteriaData) {
    this.queryMap.push(generateUpdateQuery(tableName, updateData, criteria, criteriaData));
    return this;
  },
  select(tableName, conditions, conditionsData, returnFields) {
    this.queryMap.push(generateSelectQuery(tableName, conditions, conditionsData, returnFields));
    return this;
  },
  commit() {},
};

export default {
  dataApiClient: {
    insert: (tableName, data) => _insert(tableName, data),
    insertBulk: (tableName, columns, data) => _insertBulk(tableName, columns, data),
    update: (tableName, updateData, criteria, criteriaData) => _update(tableName, updateData, criteria, criteriaData),
    query: (sql, data) => _query(sql, data),
    delete: (tableName, criteria, criteriaData) => _delete(tableName, criteria, criteriaData),
    select: (tableName, conditions, conditionsData, returnFields) =>
      _select(tableName, conditions, conditionsData, returnFields),
    transactions: () => {},
  },
  conditionsBuilder: {
    criteria,
    criteriaBuilder,
  },
};
