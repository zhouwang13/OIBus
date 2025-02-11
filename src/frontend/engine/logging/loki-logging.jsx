import React from 'react'
import PropTypes from 'prop-types'
import OibForm from '../../components/oib-form/oib-form.jsx'
import { minValue, optional } from '../../../service/validation.service.js'

const schema = { name: 'LokiLogging' }
schema.form = {
  level: {
    type: 'OibSelect',
    label: 'Level',
    md: 3,
    options: ['trace', 'debug', 'info', 'warning', 'error', 'silent'],
    defaultValue: 'info',
    help: <div>The level for the Loki log</div>,
  },
  lokiAddress: {
    type: 'OibText',
    label: 'Host',
    md: 4,
    valid: optional(),
    defaultValue: '',
    help: <div>The host name of the Loki instance</div>,
  },
  interval: {
    type: 'OibInteger',
    label: 'Interval (s)',
    newRow: false,
    md: 2,
    valid: minValue(10),
    defaultValue: 60,
    help: <div>Interval between batch of logs (in s)</div>,
  },
  tokenAddress: {
    type: 'OibText',
    label: 'Token address',
    md: 4,
    valid: optional(),
    defaultValue: '',
    help: <div>The address of the token provider (need username and password)</div>,
  },
  username: {
    type: 'OibText',
    label: 'Username',
    defaultValue: '',
    valid: optional(),
    md: 3,
  },
  password: {
    newRow: false,
    type: 'OibPassword',
    label: 'Password',
    defaultValue: '',
    valid: optional(),
    md: 3,
  },
}

const LokiLogging = ({ logParameters, onChange }) => (
  <div>
    <h6>Loki</h6>
    <OibForm onChange={onChange} schema={schema} name="engine.logParameters.lokiLog" values={logParameters} />
  </div>
)

LokiLogging.propTypes = {
  onChange: PropTypes.func.isRequired,
  logParameters: PropTypes.object.isRequired,
}
export default LokiLogging
