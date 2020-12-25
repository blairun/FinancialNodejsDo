# Getting Started

TODO ! May be easier to explain DigitalOcean app deployment in client README rather than splitting explanation between two repos.


These steps will get the FinancialVue backend server application running for you using DigitalOcean.

**Note: Following these steps will result in charges for the use of DigitalOcean services**

## Requirements

##### DigitalOcean

You need a DigitalOcean account. If you don't already have one, you can sign up at https://cloud.digitalocean.com/registrations/new

##### Plaid

You will need to sign up for [Plaid](https://plaid.com/) and apply for the development plan. It may take a day to get approved. Sign up is free and limited to 100 items (i.e. banks), so it should be more than enough for personal use.
 
## Forking the Sample App Source Code

To use all the features of App Platform, you need to be running against your own copy of this application. To make a copy, click the Fork button above and follow the on-screen instructions. In this case, you'll be forking this repo as a starting point for your own app (see [Github documentation](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo) to learn more about forking repos.

After forking the repo, you should now be viewing this README in your own github org (e.g. `https://github.com/<your-org>/sample-nodejs`)

## Deploying the App ##

Click this button to deploy the app to the DigitalOcean App Platform.

 [![Deploy to DO](https://mp-assets1.sfo2.digitaloceanspaces.com/deploy-to-do/do-btn-blue.svg)](https://cloud.digitalocean.com/apps/new?repo=https://github.com/blairun/financialvuedo/tree/main)

## Environment Variables

Fill in the following variables in the DigitalOcean app setup screen.

TODO Would probably be a better experience to use the digitalocean command line tool with yaml config file:

https://www.digitalocean.com/docs/app-platform/references/app-specification-reference/

- `PLAID_CLIENT_ID` (see https://dashboard.plaid.com/overview/development)
- `PLAID_PUBLIC_KEY`
- `PLAID_SECRET_development`
- `PLAID_SECRET_sandbox`
- `PLAID_ENV=sandbox`
- `TINGO_MARKET_DATA` (optional)
- `APP_PORT=3000`
- `DB_NAME` (db connection params are on the DigitalOcean app dashboard)
- `DB_USER`
- `DB_PASS`
- `DB_HOST`
- `DB_PORT`
- `JWT_SECRET` (set by developer)
- `CLIENT_ADDRESS=http://localhost:8080`

## Making Changes to Your App ##

As long as you left the default Autodeploy option enabled when you first launched this app, you can now make code changes and see them automatically reflected in your live application. During these automatic deployments, your application will never pause or stop serving request because the App Platform offers zero-downtime deployments.

## Learn More ##

You can learn more about the App Platform and how to manage and update your application at https://www.digitalocean.com/docs/apps/.


==============

IDEA Add instructions for local development?
### <a href="https://localhost:9990" target="_blank">Server Setup</a>

##### Install Dependencies

Run `npm install` in the server folder to install Node.js dependencies.

##### Setting up API keys

Create an `.env` file in the server directory. Variables in this file will be loaded as environment variables. This file is ignored by Git.


