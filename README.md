# Cloud based jukebox

run ```node server/server.js```, and then see the REST API in [http://localhost:3000/explorer/](http://localhost:3000/explorer/)

### REST API
See [LoopBack](http://loopback.io).

#### Examples

- Register new user:
```
curl -X POST -H "Content-Type:application/json" -d '{"email": "me@domain.com", "password": "secret"}' http://localhost:3000/api/users
```

- Login:
```
curl -X POST -H "Content-Type:application/json" -d '{"email": "me@domain.com", "password": "secret", "ttl": 1209600000}' http://localhost:3000/api/users/login
```

- Create suggestion:
```
curl -X POST --header "Content-Type: application/json" --header "Accept: application/json" -d "{  
        \"spotId\":\"57ca97a530813219709eb4e4\",
         \"song\":{  
             \"apiId\":\"Pgmx7z49OEk\",
            \"api\":\"youtube\"
        },
        \"comment\":\"I hate my parents\"
     } " "http://localhost:3000/api/users/{id}/makeSuggestion&access_token={access_token}"
```
- Get the history:
```
curl -X GET --header "Accept: application/json" "http://localhost:3000/api/Spots/{spotId}/playedSongs?access_token={access_token}&access_token={access_token}"
```

- Get the current song on spot:
```
curl -X GET --header "Accept: application/json" "http://localhost:3000/api/users/{userId}/getCurrentSong?spotId={spotId}&access_token={access_token}"
```

- Get the next song on spot:
```
  curl -X GET --header "Accept: application/json" "http://localhost:3000/api/users/{userId}/getNextSong?spotId={spotId}&access_token={access_token}"
```

- Get suggestions:
```
  curl -X GET --header "Accept: application/json" "http://localhost:3000/api/users/{id}/spotSuggestions?spotId={spotId}&access_token={access_token}"
```
returns a `suggestion` with an inner `song` and `votes` which is an array with one or no objects, which is the user's vote.

- Create a new vote
```
curl -X POST --header "Content-Type: application/json" --header "Accept: application/json" -d "{
  "score": 0,
  "date": "2016-09-29",
  "comment": "string",
  "spotId": "string",
  "suggestionId": "string"
}" "http://localhost:3000/api/users/{userId}/votes?access_token={access_token}
```

- Create a new vote - cannot create more than one vote with the same 1suggestionId` and `userdId`.
```
curl -X POST --header "Content-Type: application/json" --header "Accept: application/json" -d "{
  \"score\": 0,
  \"date\": "2016-09-29",
  \"comment\": "string",
  \"spotId\": "string",
  \"suggestionId\": "string"
}" "http://localhost:3000/api/users/{userId}/votes?access_token={access_token}
```
- Update a vote - cannot create more than one vote with the same `suggestionId` and `userdId` 

```
curl -X PUT --header "Content-Type: application/json" --header "Accept: application/json" -d "{
  \"score\": 0,
  \"date\": \"2016-09-29\",
  \"comment\": \"string\",
  \"tags\": [
    \"string\"
  ],
  \"id\": \"string\",
  \"userId\": \"string\",
  \"spotId\": \"string\",
  \"suggestionId\": \"string\"
}" "http://localhost:3000/api/users/sdfdsf/votes/sdfsdfdsf?access_token=
```
