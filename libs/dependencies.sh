#!/usr/bin/env bash
echo 'Installing Libs dependencies >>>'
npm install aws-sdk@2.1655.0 uuid@10.0.0 @hapi/joi@17.1.1 data-api-client@1.3.0 lodash@4.17.21 --silent
npm install aws-sdk uuid  @hapi/joi  amazon-cognito-identity-js  moment aws-xray-sdk@3.9.0  data-api-client lodash --silent
echo 'Installing Libs dependencies completed :)'