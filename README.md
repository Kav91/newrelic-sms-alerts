# New Relic SMS Alerts with AWS Lambda, API Gateway, SNS & Serverless Framework

Ensure serverless framework is installed https://serverless.com/.

- Update the region within serverless.yml if required
- Update numbers.js
- Update index.js with any filtering or message formatting required
- Run below:
```
npm install && sls deploy -v
```
- Copy webhook POST endpoint
- Setup webhook notification channel in New Relic

If you'd like to customise the messaging, you can find further details under: 
https://docs.newrelic.com/docs/alerts/new-relic-alerts/managing-notification-channels/customize-your-webhook-payload#variables