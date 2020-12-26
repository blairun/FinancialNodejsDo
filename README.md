## Deployment

This is the backend server code for [FinancialVue](https://github.com/blairun/FinancialVueDo). See that repo's README for deployment instructions.

---
## Local Development

**Note: To work properly this app needs to run in conjuction with the frontend client [FinancialVueDo](https://github.com/blairun/FinancialVueDo).**

Run `yarn install` in to install Node.js dependencies.

Create an `.env` file in the root directory. Variables in this file will be loaded as environment variables. Add these variables:

- `PLAID_CLIENT_ID=` (see https://dashboard.plaid.com/overview/development)
- `PLAID_PUBLIC_KEY=`
- `PLAID_SECRET_development=`
- `PLAID_SECRET_sandbox=`
- `PLAID_ENV=sandbox`
- `TIINGO_API_KEY=` (optional, see https://api.tiingo.com/)
- `APP_PORT=3000`
- `DB_NAME=` (db connection params are on the DigitalOcean app dashboard)
- `DB_USER=`
- `DB_PASS=`
- `DB_HOST=`
- `DB_PORT=`
- `JWT_SECRET=` (password chosen by developer)
- `CLIENT_ADDRESS=http://localhost:8080`

Run `nodemon app.js` to serve and hot-reload the app.

Run `seed-db` to seed database with some sample data.