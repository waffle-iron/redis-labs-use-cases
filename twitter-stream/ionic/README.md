# Twitter Stream: Ionic sample

## Install

```sh
  npm install -g cordova ionic
```

```sh
  ionic state restore
```

## Config

Edit  www/js/app.js and point apiBase to your URL.


## Usage

```sh
ionic serve
```

Will start a new tab in you browser pointing to [http://localhost:8100](http://localhost:8100)

## Mobile

To run on iOS:
  ionic run ios

To run on Android:
  ionic run android


## Hosted version

 1. [Click here to run a Heroku hosted version](http://redis-twitter-stream-ionic.herokuapp.com)
 1. [Click here to run a Pivotal hosted version](http://rl-dave.cfapps.io/)


## Deploy to Heroku

 1. Go and get a free account on [Heroku](http://www.heroku.com)
 1. Please create an app on dashboard.
 1. Setup your git remote pointing to heroku app: ```git remote add heroku_ionic git@heroku.com:{heroku-app-name}.git```

To deploy On **branch deploy-ionic-heroku** and on git clone root dir:

```sh
git push heroku_ionic `git subtree split --prefix twitter-stream/ionic/ deploy-ionic-heroku`:master --force
```
