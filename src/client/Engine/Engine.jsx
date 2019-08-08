import React from 'react'
import { Col, Row, Form, Spinner } from 'reactstrap'
import { EngineContext } from '../context/configContext.jsx'
import { AlertContext } from '../context/AlertContext.jsx'
import { OIbInteger, OIbText, OIbPassword, OIbTitle } from '../components/OIbForm'
import Filters from './Filters.jsx'
import Logging from './Logging.jsx'
import ScanModes from './ScanModes.jsx'
import Proxies from './Proxies.jsx'
import Caching from './Caching.jsx'

const Engine = () => {
  const { configState, configDispatch } = React.useContext(EngineContext)
  const { setAlert } = React.useContext(AlertContext)
  // update the Engine on the server when quitting this page
  React.useEffect(
    () => () => configDispatch({ type: 'saveEngine' }),
    [],
  )

  const onChange = (name, value, validity) => {
    console.info('dispatch:', name, value, validity)
    configDispatch({ type: 'update', name, value, validity })
  }
  const { error, config } = configState
  if (error) setAlert({ text: error, type: 'danger' })
  return config ? (
    <>
      <Form>
        <OIbTitle title="Engine Parameters">
          <>
            <p>In this section, you must define:</p>
            <ul>
              <li>The number of the port to access OIBus. The default value is 2223 can be kept unless it conflicts with an existing value.</li>
              <li>
                The user name and password that will be used to access this console. Make sure the default password is changed to avoid unauthorized
                access.
              </li>
            </ul>
          </>
        </OIbTitle>
        <Row form>
          <Col md={2}>
            <OIbInteger
              name="engine.port"
              label="Port"
              value={config.engine.port}
              min={1}
              max={65535}
              help={<div>The port to access the Admin interface</div>}
              onChange={onChange}
            />
          </Col>
        </Row>
        <Row form>
          <Col md={3}>
            <OIbText
              name="engine.user"
              label="Admin user name"
              value={config.engine.user}
              regExp={/^.{2,}$/} // i.e. min size = 2
              onChange={onChange}
              help={<div>The username of the Admin user</div>}
            />
          </Col>
          <Col md={3}>
            <OIbPassword
              label="Admin Password"
              name="engine.password"
              onChange={onChange}
              regExp={/^.{4,}$/}
              value={configState.config.engine.password}
              help={<div>The password of the Admin user</div>}
            />
          </Col>
        </Row>
        <Filters onChange={onChange} filters={config.engine.filter} />
        <Logging onChange={onChange} logParameters={config.engine.logParameters} />
        <ScanModes onChange={onChange} scanModes={config.engine.scanModes} />
        <Caching onChange={onChange} caching={config.engine.caching} />
        <Proxies onChange={onChange} proxies={config.engine.proxies} />
      </Form>
      <pre>{JSON.stringify(config)}</pre>
    </>
  ) : (
    <div className="spinner-container">
      <Spinner color="primary" type="grow" />
      ...loading configuration from OIBus server...
    </div>
  )
}

export default Engine
