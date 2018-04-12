# New Relic SMS Alerts

Ensure serverless framework is installed.

- Update the region within serverless.yml if required
- Update numbers.js
- Update index.js with any filtering or message formatting required
- Run below:
```
npm install && sls deploy -v
```
- Copy webhook POST endpoint
- Setup webhook notification channel in New Relic