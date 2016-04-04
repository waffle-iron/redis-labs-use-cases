# Twitter Stream API

## Installation

Install Process manager:
```sh
 npm install pm2 -g
```

Install all dependencies:
```sh
    npm install
```

## Configuration

*Edit config.js* and use your own credentials on twitter and redis, and keyword.

  1 .You have to be Register on twitter and then [create an app](https://apps.twitter.com/app/new),
     after that *you will get you consumer and access token keys and secrets*.
     More info on [Access tokens](https://dev.twitter.com/oauth/overview/application-owner-access-tokens)

  2. Keyword (default is #sxsw)

  3. Redis server credentials (Default config is local)


## Usage

pm2:
```sh
pm2 start pm2.json
```

It will run two process, one with the worker, and another with Express running on port 3000 serving data.

Point your browser:
  - List tweets by hashtag [http://localhost:3000/tweet/hashtag/sxsw](http://localhost:3000/tweet/hashtag/sxsw)

## Help

[Using PM2 command line](https://github.com/Unitech/pm2)
