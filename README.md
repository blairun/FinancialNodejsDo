## Deployment

This is the backend server code for [FinancialVue](https://github.com/blairun/FinancialVueDo). See that repo's README for deployment instructions.

---
## Local Development

**Note: To work properly this app needs to run in conjunction with the frontend client, [FinancialVueDo](https://github.com/blairun/FinancialVueDo), AND a PostgreSQL database which could be running locally or on a cloud platform like DigitalOcean.**

Run `yarn install` in to install Node.js dependencies.

Create an `.env` file in the root directory. Variables in this file will be loaded as environment variables. Add these variables:

- `PLAID_CLIENT_ID=` (See https://dashboard.plaid.com/overview/development)
- `PLAID_PUBLIC_KEY=`
- `PLAID_SECRET_development=`
- `PLAID_SECRET_sandbox=`
- `JWT_SECRET=` (Password chosen by developer)
- `TIINGO_API_KEY=` (Optional. For market data. See https://api.tiingo.com/)
- `DB_NAME=` (Use local db connection params or see DigitalOcean app dashboard)
- `DB_USER=`
- `DB_PASS=`
- `DB_HOST=`
- `DB_PORT=`
- `APP_PORT=8880`
- `CLIENT_ADDRESS=http://localhost:8080`

Run `nodemon app.js` to serve and hot-reload the app.

Run `seed-db` to seed database with some sample data.