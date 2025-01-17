import path from 'node:path'

import { getPaginatedLogs } from '../../service/database.service.js'

const LOG_FOLDER = './logs'
const LOG_DB_NAME = 'journal.db'
const LOG_SORTING_VALUES = ['asc', 'dsc', 'ASC', 'DSC']
const LOG_DEFAULT_PAGE_SIZE = 50
const LOG_DEFAULT_PAGE = 0

/**
 * Get logs.
 * @param {Object} ctx - The KOA context
 * @param {Object} ctx.query - The query parameters
 * @param {string} ctx.query.fromDate - From date in milliseconds
 * @param {string} ctx.query.toDate - To date in milliseconds
 * @param {string} ctx.query.verbosity - Verbosity
 * @param {function} ctx.ok - The context response
 * @return {void}
 */
const getLogsEndpoint = (ctx) => {
  const databasePath = path.resolve(LOG_FOLDER, LOG_DB_NAME)
  const now = Date.now()
  const dayAgo = new Date(now - 86400000)
  const fromDate = ctx.query.fromDate || new Date(dayAgo).toISOString()
  const toDate = ctx.query.toDate || new Date(now).toISOString()
  const verbosity = ctx.query.verbosity?.replace(/[[\]]/g, '').split(',') || 'info'
  const scope = ctx.query.scope || ''
  const textMessage = ctx.query.textMessage || ''
  const sorting = LOG_SORTING_VALUES.includes(ctx.query.sorting) ? ctx.query.sorting : 'DESC'
  const pageNumber = ctx.query.pageNumber || LOG_DEFAULT_PAGE
  const pageSize = LOG_DEFAULT_PAGE_SIZE

  const logs = getPaginatedLogs(databasePath, fromDate, toDate, scope, textMessage, verbosity, sorting, pageNumber, pageSize)
  ctx.ok(logs)
}

/**
 * Add logs to the Engine
 * @param {Object} ctx - The KOA context
 * @param {Object} ctx.request.body - Array of values
 * @return {void}
 */
const addLogs = async (ctx) => {
  const { streams } = ctx.request.body
  if (Array.isArray(streams)) {
    streams.forEach((element) => {
      element?.values.forEach((value) => {
        const formattedLog = {
          oibus: element.oibus,
          time: new Date(value[0] / 1000000),
          scope: `${element.stream.oibus}:${element.stream.scope}`,
          source: element.stream.source,
          msg: value[1],
        }
        switch (element.stream.level) {
          case 'trace':
            ctx.app.logger.trace(formattedLog)
            break

          case 'debug':
            ctx.app.logger.debug(formattedLog)
            break

          case 'info':
            ctx.app.logger.info(formattedLog)
            break

          case 'warn':
            ctx.app.logger.warn(formattedLog)
            break

          case 'error':
            ctx.app.logger.error(formattedLog)
            break

          default:
            ctx.app.logger.warn(formattedLog)
            break
        }
      })
    })
  }
  ctx.ok()
}

export default { getLogsEndpoint, addLogs }
