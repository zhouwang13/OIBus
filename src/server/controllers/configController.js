/**
 * Get the active configuration.
 * @param {Object} ctx - The KOA context
 * @return {void}
 */
const getActiveConfiguration = (ctx) => {
  ctx.ok({ config: ctx.app.engine.config })
}

/**
 * Get the modified configuration.
 * @param {Object} ctx - The KOA context
 * @return {void}
 */
const getModifiedConfiguration = (ctx) => {
  ctx.ok({ config: ctx.app.engine.modifiedConfig })
}

/**
 * Add North application.
 * @param {Object} ctx - The KOA context
 * @return {void}
 */
const addNorth = async (ctx) => {
  if (ctx.app.engine.hasNorth(ctx.request.body.applicationId)) {
    ctx.throw(409, 'The given application ID already exists')
  }

  try {
    ctx.app.engine.addNorth(ctx.request.body)
    ctx.ok()
  } catch (error) {
    ctx.throw(500, 'Unable to add new application')
  }
}

/**
 * Update North application.
 * @param {Object} ctx - The KOA context
 * @return {void}
 */
const updateNorth = (ctx) => {
  if (!ctx.app.engine.hasNorth(ctx.params.applicationId)) {
    ctx.throw(404, 'The given application ID doesn\'t exists')
  }

  if (ctx.params.applicationId !== ctx.request.body.applicationId) {
    ctx.throw(400, 'Inconsistent application ID')
  }

  try {
    ctx.app.engine.updateNorth(ctx.request.body)
    ctx.ok()
  } catch (error) {
    ctx.throw(500, 'Unable to update application')
  }
}

/**
 * Delete North application.
 * @param {Object} ctx - The KOA context
 * @return {void}
 */
const deleteNorth = (ctx) => {
  if (!ctx.app.engine.hasNorth(ctx.params.applicationId)) {
    ctx.throw(404, 'The given application ID doesn\'t exists')
  }

  try {
    ctx.app.engine.deleteNorth(ctx.params.applicationId)
    ctx.ok()
  } catch (error) {
    ctx.throw(500, 'Unable to delete application')
  }
}

/**
 * Add South equipment.
 * @param {Object} ctx - The KOA context
 * @return {void}
 */
const addSouth = (ctx) => {
  if (ctx.app.engine.hasSouth(ctx.request.body.equipmentId)) {
    ctx.throw(409, 'The given equipment ID already exists')
  }

  try {
    ctx.app.engine.addSouth(ctx.request.body)
    ctx.ok()
  } catch (error) {
    ctx.throw(500, 'Unable to add new equipment')
  }
}

/**
 * Update South equipment.
 * @param {Object} ctx - The KOA context
 * @return {void}
 */
const updateSouth = (ctx) => {
  if (!ctx.app.engine.hasSouth(ctx.params.equipmentId)) {
    ctx.throw(404, 'The given equipment ID doesn\'t exists')
  }

  if (ctx.params.equipmentId !== ctx.request.body.equipmentId) {
    ctx.throw(400, 'Inconsistent equipment ID')
  }

  try {
    ctx.app.engine.updateSouth(ctx.request.body)
    ctx.ok()
  } catch (error) {
    ctx.throw(500, 'Unable to update equipment')
  }
}

/**
 * Delete South equipment.
 * @param {Object} ctx - The KOA context
 * @return {void}
 */
const deleteSouth = (ctx) => {
  if (!ctx.app.engine.hasSouth(ctx.params.equipmentId)) {
    ctx.throw(404, 'The given equipment ID doesn\'t exists')
  }

  try {
    ctx.app.engine.deleteSouth(ctx.params.equipmentId)
    ctx.ok()
  } catch (error) {
    ctx.throw(500, 'Unable to delete equipment')
  }
}

/**
 * Update Engine.
 * @param {Object} ctx - The KOA context
 * @return {void}
 */
const updateEngine = (ctx) => {
  try {
    ctx.app.engine.updateEngine(ctx.request.body)
    ctx.ok()
  } catch (error) {
    ctx.throw(500, 'Unable to update Engine')
  }
}

/**
 * Activate the configuration.
 * @param {Object} ctx - The KOA context
 * @return {void}
 */
const activateConfiguration = (ctx) => {
  try {
    ctx.app.engine.activateConfiguration()
    ctx.ok('Reloading...')
  } catch (error) {
    ctx.throw(500, 'Unable to activate configuration')
  }
}

/**
 * Reset the configuration.
 * @param {Object} ctx - The KOA context
 * @return {void}
 */
const resetConfiguration = (ctx) => {
  try {
    ctx.app.engine.resetConfiguration()
    ctx.ok()
  } catch (error) {
    ctx.throw(500, 'Unable to reset configuration')
  }
}

module.exports = {
  getActiveConfiguration,
  getModifiedConfiguration,
  addNorth,
  updateNorth,
  deleteNorth,
  addSouth,
  updateSouth,
  deleteSouth,
  updateEngine,
  activateConfiguration,
  resetConfiguration,
}
