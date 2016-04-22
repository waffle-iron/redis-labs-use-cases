# Geospatial: Express API

## Dependencies
You will need Redis Server >= 3.2.X
At least at this date **April 22nd, 2016** while we wait for stable version i am going to describe two ways to install it.

### From Debian Repo

An /etc/apt/sources.list entry for experimental is:

```deb http://cdn.debian.net/debian/ experimental main```

To install, do:

```sh
    apt-get update
    apt-get -t experimental install redis-server
```

### Compiling from source code

```sh
    sudo apt-get install make
    sudo apt-get install gcc
    sudo apt-get install tcl
    wget https://github.com/antirez/redis/archive/3.2.0-rc3.tar.gz
    tar zxvf 3.2.0-rc3.tar.gz
    cd redis-3.2.0-rc3
    cd deps
    make geohash-int
    make hiredis
    make jemalloc
    make linenoise
    make lua
    cd ..
    make
    make test
    sudo make install
    cd utils
    sudo ./install_server.sh
```

## Install
```sh
    npm install
```

## Config

*Edit config.js* and use your own credentials on redis.

  1. Redis server credentials (Default config is local)


## Usage

```sh
    npm start
```
