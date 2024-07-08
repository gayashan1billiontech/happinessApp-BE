const _ = require('lodash');
const AWS = require('aws-sdk');

const lambda = new AWS.Lambda();
const { STAGE, LOG_LEVEL } = process.env;

const constants  = require('../constants');

const { B2B_AUTH } = constants;
let _event = undefined;
const lambdaHelper = {
  initializeEvent: event => {
    _event = event;
  },

  invokeR2: async (ms, fn, payload = null) => {
    payload = { ..._event, ...payload, permission: B2B_AUTH };

    const params = {
      FunctionName: `${ms}-${STAGE}-${fn}`,
      InvocationType: 'RequestResponse',
      LogType: 'Tail',
    };

    console.log('Invoke Function Name : ', params.FunctionName);

    if (!_.isEmpty(payload)) {
      params.Payload = JSON.stringify(payload);
      if(payload.pathParameters && LOG_LEVEL === 'DEBUG') console.log('Invoke Function pathParameters : ', payload.pathParameters);
      if(payload.queryStringParameters && LOG_LEVEL === 'DEBUG')  console.log('Invoke Function queryStringParameters : ', payload.queryStringParameters);
      if(payload.body && LOG_LEVEL === 'DEBUG') console.log('Invoke Function body : ', payload.body);
    }

    const { Payload } = await lambda.invoke(params).promise();
    if(LOG_LEVEL === 'DEBUG') console.log('Response Payload', Payload);

    const { statusCode = null, body = null } = JSON.parse(Payload);
    if (!statusCode) {
      // console.error(Payload);
      throw Error('Something went wrong while invoking lambda request-response');
    }

    const _body = JSON.parse(body);

    if (statusCode === 200 || statusCode === 201) return _body.content ? _body.content : _body;

    if (_body && _body.message) throw Error(_body.message);

    // console.error(Payload);
    // console.log(params.FunctionName, ' : End!');
    throw Error('Something went wrong while invoking lambda request-response');
  },

  invokeF2: async (fn, payload = null) => {
    payload = { ..._event, ...payload , permission: B2B_AUTH};

    const params = {
      FunctionName: `${fn}`,
      InvocationType: 'RequestResponse',
      LogType: 'Tail',
    };

    console.log('Invoke Function Name : ', params.FunctionName);

    if (!_.isEmpty(payload)) {
      params.Payload = JSON.stringify(payload);
      if(payload.pathParameters && LOG_LEVEL === 'DEBUG') console.log('Invoke Function pathParameters : ', payload.pathParameters);
      if(payload.queryStringParameters && LOG_LEVEL === 'DEBUG')  console.log('Invoke Function queryStringParameters : ', payload.queryStringParameters);
      if(payload.body && LOG_LEVEL === 'DEBUG') console.log('Invoke Function body : ', payload.body);
    }

    const { Payload } = await lambda.invoke(params).promise();
    if(LOG_LEVEL === 'DEBUG') console.log('Response Payload', Payload);

    const { statusCode = null, body = null } = JSON.parse(Payload);
    if (!statusCode) {
      // console.error(Payload);
      throw Error('Something went wrong while invoking lambda request-response');
    }

    const _body = JSON.parse(body);

    if (statusCode === 200 || statusCode === 201) return _body.content ? _body.content : _body;

    if (_body && _body.message) throw Error(_body.message);

    // console.error(Payload);
    // console.log(params.FunctionName, ' : End!');
    throw Error('Something went wrong while invoking lambda request-response');
  },

  invokeR2usingEvent: async (ms, fn, payload = null) => {
    payload = { ..._event, ...payload, permission: B2B_AUTH };

    const params = {
      FunctionName: `${ms}-${STAGE}-${fn}`,
      InvocationType: 'Event',
      LogType: 'Tail',
    };

    console.log('Invoke Function Name : ', params.FunctionName);

    if (!_.isEmpty(payload)) {
      params.Payload = JSON.stringify(payload);
      if(payload.pathParameters && LOG_LEVEL === 'DEBUG') console.log('Invoke Function pathParameters : ', payload.pathParameters);
      if(payload.queryStringParameters && LOG_LEVEL === 'DEBUG')  console.log('Invoke Function queryStringParameters : ', payload.queryStringParameters);
      if(payload.body && LOG_LEVEL === 'DEBUG') console.log('Invoke Function body : ', payload.body);
    }

    const Payload  = await lambda.invoke(params).promise();
    if(LOG_LEVEL === 'DEBUG') console.log('Response Payload', Payload);

    const { StatusCode = null } = Payload;
    if (!StatusCode) {
      throw Error('Something went wrong while invoking lambda request-response');
    }

    if (StatusCode === 200 || StatusCode === 201 || StatusCode === 202) return Payload;

    throw Error('Something went wrong while invoking lambda request-response');
  },

  invokeF2usingEvent: async (fn, payload = null) => {
    payload = { ..._event, ...payload, permission: B2B_AUTH };

    const params = {
      FunctionName: `${fn}`,
      InvocationType: 'Event',
      LogType: 'Tail',
    };

    console.log('Invoke Function Name : ', params.FunctionName);

    if (!_.isEmpty(payload)) {
      params.Payload = JSON.stringify(payload);
      if(payload.pathParameters && LOG_LEVEL === 'DEBUG') console.log('Invoke Function pathParameters : ', payload.pathParameters);
      if(payload.queryStringParameters && LOG_LEVEL === 'DEBUG')  console.log('Invoke Function queryStringParameters : ', payload.queryStringParameters);
      if(payload.body && LOG_LEVEL === 'DEBUG') console.log('Invoke Function body : ', payload.body);
    }

    const Payload  = await lambda.invoke(params).promise();
    if(LOG_LEVEL === 'DEBUG') console.log('Response Payload', Payload);
    
    const { StatusCode = null } = Payload;
    if (!StatusCode) {
      throw Error('Something went wrong while invoking lambda request-response');
    }
  
    if (StatusCode === 200 || StatusCode === 201 || StatusCode === 202) return Payload;

    throw Error('Something went wrong while invoking lambda request-response');
  },
};

module.exports = lambdaHelper;
