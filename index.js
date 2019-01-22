const pino = require('pino')();
const AWS = require('aws-sdk');
const sns = new AWS.SNS();

//All severity, state & event types have been added, remove or add as needed for your purpose.
//Leave array(s) empty to default all options
//https://docs.newrelic.com/docs/alerts/new-relic-alerts/managing-notification-channels/customize-your-webhook-payload#webhook-format-examples

const severities = ["INFO", "WARN", "CRITICAL"];
const states = ["OPEN", "ACKNOWLEDGED", "CLOSED"];
const eventTypes = [
                    "VIOLATION_OPEN", "VIOLATION_CLOSE", 
                    "INCIDENT", "INCIDENT_OPEN", "INCIDENT_ACKNOWLEDGED", "INCIDENT_RESOLVED", "INCIDENT_CLOSED",
                    "NOTIFICATION_FAILURE", "NOTIFICATION_QUEUED", "NOTIFICATION_SENT", 
                    "NOTIFICATION_INFORMATION", "NOTIFICATION_INFORMATION_SENT", "NOTIFICATION_INFORMATION_FAILURE",
                    "NOTIFICATION_TEST", "NOTIFICATION_TEST_SENT", "NOTIFICATION_TEST_FAILURE" 
                    ];

const numbers = require("./numbers");

module.exports.handler = (event, context, callback) => {
  const data = JSON.parse(event.body);

  //uncomment if you want to log incoming payload
  //pino.info(data)

  if(checkAlert(data.severity, data.current_state, data.event_type)){

    let callNumbers = numbers.default
    if(numbers[data.policy_name] != undefined){
        callNumbers = numbers[data.policy_name]
    }

    let promises = callNumbers.map((number) => {
        let msg = `${data.condition_name} - ${data.details}\n`;
            msg += `${data.severity} - ${data.current_state}\n`;
            msg += `${data.event_type} - ${data.policy_name}\n`;
            msg += `IncidentURL: ${data.incident_url}`;

        let params = {
            Message: msg,
            MessageStructure: 'string',
            PhoneNumber: number
        };
    
        return sns.publish(params).promise().then((data) =>
            `Sent: ${number}`
        ).catch((err) => {
            pino.error(err)
            return `Failed: ${number}`
        });
    })

    Promise.all(promises).then((values) => {
        const response = {
            statusCode: 200,
            body: JSON.stringify({
                msg: "SMS Sent",
                data: values
            }),
        };
        callback(null, response);
    });

  }else{

    const output = {
        msg: "SMS does not need to be sent",
        severity: data.severity,
        current_state: data.current_state,
        event_type: data.event_type
    }

    pino.info(output)

    const response = {
        statusCode: 200,
        body: JSON.stringify(output),
    };
    callback(null, response);

  }

  function checkAlert(severity, state, eventType){
    if( (severities.includes(severity.toUpperCase()) || severities.length == 0) && 
        (states.includes(state.toUpperCase()) || states.length == 0) && 
        (eventTypes.includes(eventType.toUpperCase()) || eventTypes.length == 0)){
            return true
      }else{
            return false
      }
  }

};