const { sequelize } = require("../config/db");
const { QueryTypes } = require("sequelize");
 
class Datatables {
  static async build(
    req,
    sql,
    whereClause = "",
    bindParams = {},
    callback = null,
    groupBy = ""
  ) {
    const { draw, start, length, order, columns, search } = req.body;
    const searchValue = search?.value || "";
    const orderColumnIndex = order?.[0]?.column;
    const orderColumnName =
      orderColumnIndex !== undefined ? columns[orderColumnIndex]?.data : null;
    const orderDirection = order?.[0]?.dir || "ASC";
 
    // Step 1: Build search clause (no trailing AND)
    let searchQuery = this.buildSearchQuery(
      searchValue,
      columns,
      bindParams
    ).trim();
 
    if (searchQuery.endsWith("AND")) {
      searchQuery = searchQuery.slice(0, -3).trim(); // remove trailing AND
    }
 
    // Step 2: Build full WHERE clause
    let fullWhereClause = "";
    if (searchQuery && whereClause) {
      fullWhereClause = `WHERE (${searchQuery}) AND ${whereClause}`;
    } else if (searchQuery) {
      fullWhereClause = `WHERE (${searchQuery})`;
    } else if (whereClause) {
      fullWhereClause = `WHERE ${whereClause}`;
    } else {
      fullWhereClause = "WHERE 1=1";
    }
 
    return this.getResults(
      sql,
      whereClause,
      fullWhereClause,
      bindParams,
      orderColumnName,
      orderDirection,
      start,
      length,
      draw,
      groupBy
    );
  }
 
  static buildSearchQuery(searchValue, columns, bindParams) {
    if (!searchValue) return "";
 
    const searchConditions = [];
    searchValue = searchValue?.trim();
    columns.forEach((column, index) => {
      if (column.searchable === "true" && column.name) {
        const bindKey = `search_${index}`;
        searchConditions.push(
          `CAST(${column.name} AS TEXT) ILIKE $${bindKey}`
        );
        bindParams[bindKey] = `%${searchValue}%`; // wrapped with %
      }
    });
 
    if (searchConditions.length === 0) return "";
 
    return `(${searchConditions.join(" OR ")})`;
  }
 
  static async getResults(
    sql,
    defaultWhere,
    where,
    bindParams,
    orderBy,
    sortType,
    start,
    length,
    draw,
    groupBy
  ) {
    const groupByClause = groupBy ? `GROUP BY ${groupBy}` : "";
    const paginationClause =
      orderBy && sortType
        ? `ORDER BY ${orderBy} ${sortType} LIMIT ${length} OFFSET ${start}`
        : "";
 
    const paginatedSql = `${sql} ${where} ${groupByClause} ${paginationClause}`;
    const countSql = `${sql} ${where} ${groupByClause}`;
 
    const totalRecordsData = await sequelize.query(countSql, {
      type: QueryTypes.SELECT,
      bind: bindParams,
    });
 
    const totalRecords = totalRecordsData.length;
console.log("Total Records: ", paginatedSql);
console.log("bindParams: ", bindParams);
 
    const paginatedData = await sequelize.query(paginatedSql, {
      type: QueryTypes.SELECT,
      bind: bindParams,
    });
 
    return {
      draw: Number(draw),
      recordsTotal: totalRecords,
      recordsFiltered: totalRecords,
      data: paginatedData,
    };
  }
}
 
module.exports = Datatables;