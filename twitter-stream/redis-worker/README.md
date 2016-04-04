# Twitter Stream: Redis Worker Service

## Install

if using process manager pm2:
```sh
 npm install pm2 -g
```

Install all dependencies:
```sh
    npm install
```

## Config

*Edit config.js* and use your own credentials on twitter and redis, and keyword.

  1. You have to be Register on twitter and then [create an app](https://apps.twitter.com/app/new),
     after that *you will get you consumer and access token keys and secrets*.
     More info on [Access tokens](https://dev.twitter.com/oauth/overview/application-owner-access-tokens)

  1. Keyword (default is #sxsw)

  1. Redis server credentials (Default config is local)


## Usage

Standalone: ```npm start```

pm2: ```pm2 start pm2.json```

## Help

[Using PM2 command line](https://github.com/Unitech/pm2)
