const constants = require('../constants');
const { B2B_AUTH } = constants;

const handler = {
    b2bAuthValidator: event => {
        console.log('event :', event);
        if (event.permission && event.permission === B2B_AUTH) {
          return true;
        } else if (event.body && event.body.permission === B2B_AUTH) {
          return true;
        } else if (event.requestContext && event.requestContext.b2bAuth === B2B_AUTH) {
          return true;
        } else {
          return false;
        }
    }
}

module.exports = handler;