const hapinessHandler = require("./handler.js");

module.exports.createSurvey = async (event) => await hapinessHandler.hello(event);
module.exports.createSurveyAdmin = async (event) => await hapinessHandler.hello(event);