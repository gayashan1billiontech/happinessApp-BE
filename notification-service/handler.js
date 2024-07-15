
const hapinessHandler = {

  hello: async (event) => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Go Serverless v4! Your function executed successfully!",
      }),
    };
  },

  helloAdmin: async (event) => {
    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Go Serverless v4! Your function executed successfully!",
      }),
    };
  }


}

module.exports = hapinessHandler;