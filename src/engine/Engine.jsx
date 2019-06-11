import React from 'react'
import Form from 'react-jsonschema-form-bs4'
import ReactJson from 'react-json-view'
import apis from '../client/services/apis'

const Engine = () => {
  const [configJson, setConfigJson] = React.useState({ engine: {} })
  React.useEffect(() => {
    // eslint-disable-next-line consistent-return
    fetch('/config').then((response) => {
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.indexOf('application/json') !== -1) {
        return response.json().then(({ config }) => {
          setConfigJson(config)
        })
      }
    })
  }, [])

  /**
   * Submit the updated engine
   * @param {*} engine The changed engine
   * @returns {void}
   */
  const handleSubmit = async (engine) => {
    try {
      await apis.updateEngine(engine)
    } catch (error) {
      console.error(error)
    }
  }
  const transformErrors = errors => (errors.map((error) => {
    if (error.schemaPath === '#/properties/filter/items/pattern') {
      error.message = 'Only IPV4 or IPV6 format is allowed'
    }
    return error
  })
  )

  const log = type => console.info.bind(console, type)
  return (
    <>
      <Form
        formData={configJson && configJson.engine}
        liveValidate
        showErrorList={false}
        schema={Engine.schema}
        uiSchema={Engine.uiSchema}
        autocomplete="on"
        onChange={log('changed')}
        onSubmit={({ formData }) => handleSubmit(formData)}
        onError={log('errors')}
        transformErrors={transformErrors}
      />
      <ReactJson src={configJson.engine} name={null} collapsed displayObjectSize={false} displayDataTypes={false} enableClipboard={false} />
    </>
  )
}

export default Engine

Engine.schema = {
  title: 'Engine',
  type: 'object',
  required: ['port', 'user', 'password'],
  properties: {
    port: { type: 'number', title: 'Port', default: 2223, minimum: 1, maximum: 65535 },
    user: { type: 'string', title: 'User', default: 'admin' },
    password: { type: 'string', title: 'Password', default: 'd74ff0ee8da3b9806b18c877dbf29bbde50b5bd8e4dad7a3a725000feb82e8f1' },
    filter: {
      type: 'array',
      title: 'Network Filter',
      items: {
        type: 'string',
        // eslint-disable-next-line max-len
        pattern: '((^s*((([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]).){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5]))s*$)|(^s*((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]d|1dd|[1-9]?d)(.(25[0-5]|2[0-4]d|1dd|[1-9]?d)){3}))|:)))(%.+)?s*$))',
      },
      minItems: 1,
      uniqueItems: true,
      default: ['127.0.0.1'],
    },
    logParameters: {
      type: 'object',
      title: 'Log Parameters',
      properties: {
        consoleLevel: { type: 'string', enum: ['debug', 'info', 'warning', 'error'], title: 'Console Level', default: 'debug' },
        fileLevel: { type: 'string', enum: ['debug', 'info', 'warning', 'error'], title: 'File Level', default: 'debug' },
        filename: { type: 'string', title: 'Filename', default: './logs/journal.log' },
        maxsize: { type: 'number', title: 'Max Size (Byte)', default: 1000000 },
        maxFiles: { type: 'number', title: 'Max Files', default: 5 },
        tailable: { type: 'boolean', title: 'Tailable', default: true },
        sqliteLevel: { type: 'string', enum: ['debug', 'info', 'warning', 'error'], title: 'SQLite logging Level', default: 'debug' },
        sqliteFilename: { type: 'string', title: 'Filename', default: './logs/journal.db' },
      },
    },
    caching: {
      type: 'object',
      title: 'Cache Parameters',
      properties: {
        cacheFolder: { type: 'string', title: 'Cache Folder', default: './cache' },
        archiveFolder: { type: 'string', title: 'Archive Folder', default: './cache/archived/' },
        archiveMode: { type: 'string', enum: ['archive', 'delete'], title: 'Archive Mode', default: 'archive' },
      },
    },
    proxies: {
      type: 'array',
      title: 'Proxy Parameters',
      items: {
        type: 'object',
        properties: {
          name: {
            type: 'string',
            title: 'Name',
          },
          protocol: {
            type: 'string',
            enum: ['http', 'https'],
            title: 'Protocol',
            default: 'http',
          },
          host: {
            type: 'string',
            title: 'Host',
          },
          port: {
            type: 'number',
            title: 'Port',
          },
          username: {
            type: 'string',
            title: 'Username',
          },
          password: {
            type: 'string',
            title: 'Password',
          },
        },
      },
    },
    scanModes: {
      type: 'array',
      title: 'Scan Modes',
      items: {
        type: 'object',
        required: ['scanMode', 'cronTime'],
        properties: {
          scanMode: {
            type: 'string',
            title: 'Scan Mode',
          },
          cronTime: {
            type: 'string',
            title: 'Cron Time',
          },
        },
      },
    },
  },
}

Engine.uiSchema = {
  port: { 'ui:help': <div>The port to access the web interface to OIBus. Valid values range from 1 through 65535.</div> },
  password: { 'ui:widget': 'password' },
  filter: { 'ui:help': <div>The list of IP addresses allowed to access the Web interface</div> },
  logParameters: {
    tailable: {
      'ui:help': (
        <div>
          If true, log files will be rolled based on maxsize and maxfiles, but in ascending order. The filename will always have the most recent log
          lines. The larger the appended number, the older the log file. This option requires maxFiles to be set, or it will be ignored.
        </div>
      ),
    },
  },
  caching: {
    cacheFolder: { 'ui:help': <div>Where to store the cached data</div> },
    archiveFolder: { 'ui:help': <div>Required when archiveMode is &apos;archive&apos; for files</div> },
    archiveMode: { 'ui:help': <div> Move or delete files</div> },
  },
  scanModes: {
    'ui:help': (
      <div>
        Scan mode: name of the scan mode defined by the user
        <br />
        Cron time: interval for the scans
        <br />
        Example to scan every 5 seconds at 6am on the first day of each month in 2019
        <br />
        2019 * 1 6 * /5
        <br />
        <a href="https://github.com/paragi/timexe#readme"> For additional information, please refer the documentation of timexe.</a>
      </div>
    ),
  },
}
