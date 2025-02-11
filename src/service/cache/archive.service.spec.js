import path from 'node:path'
import fs from 'node:fs/promises'

import ArchiveService from './archive.service.js'

import { createFolder } from '../utils.js'

jest.mock('node:fs/promises')

// Mock logger
const logger = {
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  trace: jest.fn(),
}
jest.mock('../../service/utils')
// Method used to flush promises called in setTimeout
const flushPromises = () => new Promise(jest.requireActual('timers').setImmediate)
const nowDateString = '2020-02-02T02:02:02.222Z'
let archiveService = null
describe('ArchiveService', () => {
  beforeEach(async () => {
    jest.resetAllMocks()
    jest.useFakeTimers().setSystemTime(new Date(nowDateString))

    archiveService = new ArchiveService('northId', logger, 'myCacheFolder', true, 1)
  })

  it('should be properly initialized with archive enabled', async () => {
    archiveService.refreshArchiveFolder = jest.fn()
    await archiveService.start()
    expect(archiveService.northId).toEqual('northId')
    expect(archiveService.baseFolder).toEqual('myCacheFolder')
    expect(createFolder).toHaveBeenCalledWith(path.resolve('myCacheFolder', 'archive'))

    expect(archiveService.refreshArchiveFolder).toHaveBeenCalledTimes(1)
  })

  it('should be properly initialized with archive disabled', async () => {
    archiveService.enabled = false
    archiveService.refreshArchiveFolder = jest.fn()
    await archiveService.start()
    expect(archiveService.northId).toEqual('northId')
    expect(archiveService.baseFolder).toEqual('myCacheFolder')
    expect(createFolder).toHaveBeenCalledWith(path.resolve('myCacheFolder', 'archive'))

    expect(archiveService.refreshArchiveFolder).not.toHaveBeenCalled()
  })

  it('should properly stop', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

    archiveService.stop()
    expect(clearTimeoutSpy).not.toHaveBeenCalled()

    archiveService.archiveTimeout = 1
    archiveService.stop()
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1)
  })

  it('should properly move file from cache to archive folder', async () => {
    fs.rename.mockImplementationOnce(() => {}).mockImplementationOnce(() => {
      throw new Error('rename error')
    })

    await archiveService.archiveOrRemoveFile('myFile.csv')
    expect(logger.debug).toHaveBeenCalledWith(`File "myFile.csv" moved to "${path.resolve(archiveService.archiveFolder, 'myFile.csv')}".`)

    await archiveService.archiveOrRemoveFile('myFile.csv')
    expect(logger.error).toHaveBeenCalledWith(new Error('rename error'))
  })

  it('should properly remove file from cache', async () => {
    archiveService.enabled = false
    fs.unlink.mockImplementationOnce(() => {}).mockImplementationOnce(() => {
      throw new Error('unlink error')
    })

    await archiveService.archiveOrRemoveFile('myFile.csv')
    expect(logger.debug).toHaveBeenCalledWith('File "myFile.csv" removed from disk.')

    await archiveService.archiveOrRemoveFile('myFile.csv')
    expect(logger.error).toHaveBeenCalledWith(new Error('unlink error'))
  })

  it('should refresh archive folder', async () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout')

    fs.readdir.mockImplementationOnce(() => []).mockImplementation(() => ['myFile1', 'myFile2'])
    archiveService.removeFileIfTooOld = jest.fn()

    await archiveService.refreshArchiveFolder()
    expect(clearTimeoutSpy).not.toHaveBeenCalled()
    expect(logger.debug).toHaveBeenCalledWith('Parse archive folder to remove old files.')
    expect(logger.debug).toHaveBeenCalledWith(`The archive folder "${path.resolve('myCacheFolder', 'archive')}" is empty. Nothing to delete.`)

    jest.advanceTimersByTime(3600000)
    await flushPromises()

    expect(archiveService.removeFileIfTooOld).toHaveBeenCalledTimes(2)
  })

  it('should manage archive folder readdir error', async () => {
    fs.readdir.mockImplementationOnce(() => {
      throw new Error('readdir error')
    })
    archiveService.removeFileIfTooOld = jest.fn()

    await archiveService.refreshArchiveFolder()
    expect(archiveService.removeFileIfTooOld).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalledWith(new Error('readdir error'))
  })

  it('should remove file if too old', async () => {
    fs.stat.mockImplementationOnce(() => ({ mtimeMs: new Date('2020-02-01T02:02:02.222Z').getTime() }))
      .mockImplementationOnce(() => ({ mtimeMs: new Date('2020-02-02T02:02:01.222Z').getTime() }))

    await archiveService.removeFileIfTooOld('myOldFile.csv', new Date(), 'archiveFolder')
    expect(fs.unlink).toHaveBeenCalledWith(path.join('archiveFolder', 'myOldFile.csv'))
    expect(logger.debug).toHaveBeenCalledWith(`File "${path.join('archiveFolder', 'myOldFile.csv')}" removed from archive.`)
    await archiveService.removeFileIfTooOld('myNewFile.csv', new Date(), 'archiveFolder')
    expect(logger.debug).toHaveBeenCalledTimes(1)
    expect(fs.unlink).toHaveBeenCalledTimes(1)
  })

  it('should log an error if can not remove old file', async () => {
    fs.stat.mockImplementationOnce(() => ({ mtimeMs: new Date('2020-02-01T02:02:02.222Z').getTime() }))
    fs.unlink.mockImplementationOnce(() => {
      throw new Error('unlink error')
    })

    await archiveService.removeFileIfTooOld('myOldFile.csv', new Date(), 'archiveFolder')
    expect(logger.error).toHaveBeenCalledWith(new Error('unlink error'))
  })

  it('should log an error if a problem occur accessing the file', async () => {
    fs.stat.mockImplementationOnce(() => {
      throw new Error('stat error')
    })

    await archiveService.removeFileIfTooOld('myOldFile.csv', new Date(), 'archiveFolder')
    expect(fs.unlink).not.toHaveBeenCalled()
    expect(logger.error).toHaveBeenCalledWith(new Error('stat error'))
    expect(logger.error).toHaveBeenCalledTimes(1)
  })
})
