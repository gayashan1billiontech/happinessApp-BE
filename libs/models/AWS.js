const AWSXRay = require('aws-xray-sdk');
const AwsSdk = AWSXRay.captureAWS(require('aws-sdk'));
const AmazonCognitoIdentity = require('amazon-cognito-identity-js');

const { SES_REGION, REGION } = process.env;

let instance = null;
class AWS {
  static getInstance() {
    if (instance === null) instance = new AWS();

    return instance;
  }

  get ses() {
    if (!this.sesInstance) {
      this.sesInstance = new AwsSdk.SES({
        apiVersion: '2010-12-01',
        region: SES_REGION,
      });
    }

    return this.sesInstance;
  }

  get sts() {
    if (!this.stsClient)
      this.stsClient = new AwsSdk.STS();

    return this.stsClient;
  }

  get iot() {
    if (!this.iotClient)
      this.iotClient = new AwsSdk.Iot();

    return this.iotClient;
  }

  get s3() {
    if (!this.s3Client)
      this.s3Client = new AwsSdk.S3();

    return this.s3Client;
  }

  get sqs() {
    if (!this.sqsClient)
      this.sqsClient = new AwsSdk.SQS({ region: REGION });

    return this.sqsClient;
  }

  get iam() {
    if (!this.iamClient) this.iamClient = new AwsSdk.IAM();

    return this.iamClient;
  }

  get ssm() {
    if (!this.ssmClient) this.ssmClient = new AwsSdk.SSM();

    return this.ssmClient;
  }



  get cloudWatchLogsClient() {
    if (!this.cloudWatchLogs)
      this.cloudWatchLogs = new AwsSdk.CloudWatchLogs({apiVersion: '2014-03-28'});

    return this.cloudWatchLogs;
  }

  get cloudWatchClient() {
    if (!this.cloudWatch)
      this.cloudWatch = new AwsSdk.CloudWatch();

    return this.cloudWatch;
  }

  async getIoTEndpoint() {
    if (!this.iotEp)
      this.iotEp = await AWS.getInstance()
        .iot.describeEndpoint({ endpointType: 'iot:Data-ATS' })
        .promise();

    return this.iotEp;
  }

  async getIoTData() {
    const endpoint = await AWS.getInstance().getIoTEndpoint();
    if (!this.iotData)
      this.iotData = new AwsSdk.IotData({ endpoint: endpoint.endpointAddress });

    return this.iotData;
  }

  async iotDataClient() {
    if (!this.iotDC)
      this.iotDC = await this.iot.describeEndpoint({ endpointType: 'iot:Data-ATS' }).promise();

    return this.iotDC;
  }

  static cognitoUserAttribute(data) {
    const cognitoUserAttribute = new AmazonCognitoIdentity.CognitoUserAttribute(data);
    return cognitoUserAttribute;
  }

  static cognitoUserPool(data) {
    const pool = new AmazonCognitoIdentity.CognitoUserPool(data);
    return pool;
  }

  static cognitoUser(user) {
    const userData = new AmazonCognitoIdentity.CognitoUser(user);
    return userData;
  }

  static authenticationDetails(data) {
    const details = new AmazonCognitoIdentity.AuthenticationDetails(data);
    return details;
  }

  static cognitoIdentityServiceProvider() {
    const detail = new AwsSdk.CognitoIdentityServiceProvider();
    return detail;
  }

  static unmarshall(data) {
    const result = AwsSdk.DynamoDB.Converter.unmarshall(data);
    return result;
  }
}

module.exports = AWS;
