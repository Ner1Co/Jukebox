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
     } " "http://localhost:3000/api/users/{id}/newSuggestion"
```

- Add played song (suggestion) on spot:
```
curl -X POST --header "Content-Type: application/json" --header "Accept: application/json" -d "{
  \"date\": \"2016-09-03\",
  \"suggestionId\": \"57cad9ae85dfd0006ce46e50\"
}" "http://localhost:3000/api/Spots/57ca97a530813219709eb4e4/playedSongs"
```

- Get the currnet song on spot:
```
curl -X GET --header "Accept: application/json" "http://localhost:3000/api/users/1/getCurrentSong?spotId=57ca97a530813219709eb4e4"
```

- Get the next song on spot:
```
  curl -X GET --header "Accept: application/json" "http://localhost:3000/api/users/{userId}/getNextSong?spotId={spotId}"
```
