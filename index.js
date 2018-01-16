import AWS from 'aws-sdk/dist/aws-sdk-react-native';

/** Utility class for Amazon web services SDK. */
export default class AWSSNS {
  /**
   * Authenticate with AWS cognito, register device, and subsribe to channel.
   * @param {Object} options - required parameters
   * @param {string} options.deviceId - device's PN token
   * @param {string} options.applicationArn - application's Amazon resource name
   * @param {string} options.TopicArn - topics Amazon resource name
   * @param {string} options.poolId - AWS cognito identifier
   */
  constructor(options) {
    this.deviceId = options.deviceId;
    this.applicationArn = options.applicationArn;
    this.topicArn = options.topicArn;
    this.poolId = options.poolId;

    AWS.config.update({
      region: 'us-west-2',
      credentials: new AWS.CognitoIdentityCredentials({
        IdentityPoolId: this.poolId
      })
    });
  }

  /**
   * Register device with amazon simple notification system
   */
  registerDeviceEndpoint() {
    this.SNS = new AWS.SNS();
      return this.SNS.createPlatformEndpoint({
        Token: this.deviceId,
        PlatformApplicationArn: this.applicationArn
      }, (err, data) => {
        if (err) {
          console.log('error registering device', err);
          return;
        }

        const params = {
          Protocol: 'application',
          TopicArn: this.topicArn,
          Endpoint: data.EndpointArn
        };

        this.subscribeToTopic(params);
      });
  }

  /**
   * Subscribe to aws sns topic
   * @param {Object} params - required parameters to subscribe to a top
   * @param {string} params.Protocol - type of topic
   * @param {string} params.TopicArn - topic Amazon resource name
   * @param {string} params.TopicArn - registered device's Amazon resource name
   */
  subscribeToTopic(params) {
    this.SNS.subscribe(params, (subErr) => {
      if (subErr) {
        console.log('error subscribing to topic', subErr);
        return;
      }
    });
  }
}
