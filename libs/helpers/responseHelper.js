
const constants  = require('../constants');
const { LOG_LEVEL, ALLOWED_ORIGINS_S3, ALLOWED_ORIGINS, ALLOWED_ORIGINS_CF } = process.env;
const { B2B_AUTH } = constants;


const getAllowedOrigins = (event)=>{

  if(!event || !event.headers || (event.headers && !event.headers.Host) || event.permission === B2B_AUTH) return null;

  const originConfig = ALLOWED_ORIGINS_S3;
  const originString = ALLOWED_ORIGINS;
  const originCF = ALLOWED_ORIGINS_CF;
  let allOrigins = [];
  let final = null;

  console.log('originConfig', originConfig);
  console.log('originString', originString);
  console.log('originCF', originCF);

  if (originString) {
    if (originString.includes('&&')) {
      const splittedArray = originString.split('&&');
      allOrigins = allOrigins.concat(splittedArray);
    } else {
      allOrigins.push(originString);
    }
  }
  if (originConfig) {
    allOrigins.push(originConfig);
  }
  if (originCF) {
    allOrigins.push(originCF);
  }

  console.log('allOrigins', allOrigins);

  if (allOrigins.includes('*')) {
    final = '*';
  } else if (allOrigins.includes(event.headers.origin)) {
    final = event.headers.origin;
  }

  console.log('final', final);

  return final;

}


const getResponseHeaders=(allowedOrigin)=>{

  const headers = {
    'Content-Type': 'application/json',
    'X-XSS-Protection':'1; mode=block',
    'X-Content-Type-Options':'nosniff',
    'Cache-Control':'no-store, no-cache',
    'Strict-Transport-Security':'max-age=31536000; includeSubDomains',
    'Content-Security-Policy':"default-src 'none'"
  };

  if(allowedOrigin){
    headers['Access-Control-Allow-Origin']=allowedOrigin // Required for CORS support to work
  }

  return headers;

}


module.exports = {
  //success response with Body
  sendSuccess: function(event,message, content = {}, result = true) {
    const allowedOrigin = getAllowedOrigins(event)
    let successResponse = {
      statusCode: 200,
      headers: getResponseHeaders(allowedOrigin),
      body: JSON.stringify({
        result,
        message,
        content,
      }),
    };

    if( LOG_LEVEL === 'DEBUG')console.log('Response : ',successResponse);
    return successResponse;
  },

  sendSuccessReport: function(event,message, content = {}, result = true) {
    const allowedOrigin = getAllowedOrigins(event)
    let successResponse = {
      statusCode: 200,
      headers: getResponseHeaders(allowedOrigin),
      body: JSON.stringify({
        success:true,
        message,
        data:content,
      }),
    };

    if( LOG_LEVEL === 'DEBUG')console.log('Response : ',successResponse);
    return successResponse;
  },

  createResoponse: function(event,message, content = {}, result = true) {
    const allowedOrigin = getAllowedOrigins(event)
    let successResponse = {
      statusCode: 201,
      headers: getResponseHeaders(allowedOrigin),
      body: JSON.stringify({
        result,
        message,
        content,
      }),
    };
    return successResponse;
  },

  sendError: (event,statusCode, message, err, errorPayload) => {
    const allowedOrigin = getAllowedOrigins(event)
    if( LOG_LEVEL === 'DEBUG')console.log(err);
    const resData = {
      statusCode,
      headers: getResponseHeaders(allowedOrigin),
      body: JSON.stringify({ message, ...errorPayload }),
    };
    return resData;
  },
};
