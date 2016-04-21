# Geospatial

## [Express API](express-api)
  1. Api layer on express to access (locations list, search, etc).

## [Frontend: Ionic Framework](ionic)
  1. Mobile app consuming Express API
  1. Features: Show your current location on google maps and near locations. Let you change radius and location.
  1. [Click here to run a Heroku hosted version](http://redis-geospatial-ionic.herokuapp.com)

# Redis usage

## Data types and abstractions
  1. auths (hash: uuid, userId)
  1. user_next_id (string: lastUserId )
  1. locationGeoSet (Geo Set based on zset: locationName, geoHash )

## Functions
  1. addLocation: Add location to Geo set
    **GEOADD(locationGeoSet , longitude, latitude, member)**
  1. findLocationByMember: Find members near from other member + radius
    **GEORADIUSBYMEMBER(locationGeoSet, member, radius, unit)**
  1. findLocationByCoords: Find members and its longitud and latitud near from longitud, latitude + radius
    **GEORADIUS(locationGetSet, longitude, latitude, radius, unit, 'WITHCOORDS' )**
  1. findLocationPos: Get longitud and latitude from member
    **GEOPOS(locationGetSet, member)**
  1. findMembers: Get all members from geoset
    **ZRANGE(locationGeoSet, 0, -1)**
