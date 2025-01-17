import fs from 'node:fs/promises'

import NorthConnector from '../north-connector.js'
import manifest from './manifest.js'

/**
 * Class Console - display values and file path into the console
 */
export default class Console extends NorthConnector {
  static category = manifest.category

  /**
   * Constructor for Console
   * @constructor
   * @param {Object} configuration - The North connector configuration
   * @param {ProxyService} proxyService - The proxy service
   * @param {Object} logger - The Pino child logger to use
   * @return {void}
   */
  constructor(
    configuration,
    proxyService,
    logger,
  ) {
    super(
      configuration,
      proxyService,
      logger,
      manifest,
    )

    const { verbose } = configuration.settings
    this.verbose = verbose
  }

  /**
   * Handle values by printing them to the console.
   * @param {Object[]} values - The values
   * @returns {Promise<void>} - The result promise
   */
  async handleValues(values) {
    if (this.verbose) {
      console.table(values, ['pointId', 'timestamp', 'data'])
    } else {
      process.stdout.write(`North Console sent ${values.length} values.\r\n`)
    }
  }

  /**
   * Handle the file by displaying its name in the console
   * @param {String} filePath - The path of the file
   * @returns {Promise<void>} - The result promise
   */
  async handleFile(filePath) {
    if (this.verbose) {
      const stats = await fs.stat(filePath)
      const fileSize = stats.size
      const data = [{
        filePath,
        fileSize,
      }]
      console.table(data)
    } else {
      process.stdout.write('North Console sent 1 file.\r\n')
    }
  }
}
