import Behaviour from './Behaviour'

const promisify = (
  subject,
  context = null,
  behaviour = {}
) => {
  behaviour = Object.assign(new Behaviour(), behaviour)
  return behaviour.promisify(subject, context)
}

module.exports = promisify
