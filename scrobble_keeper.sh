# set up couch url, just in case
export COUCH_URL="http://localhost:5984"

# get scrobbles as json via https://lastfm.ghan.nl/export/
echo "getting scrobbles...\n"
node get_scrobbles.js

# pipe scrobble json to jq, filtering only the tracks, and redirect to json file
echo "transforming scrobbles...\n"
cat *.json | jq -c '.[].track[]' > tracks.json

# delete old db and make a new one
echo "deleting old db and recreating...\n"
curl -X DELETE http://127.0.0.1:5984/scrobbles > /dev/null 2>&1
curl -X PUT http://127.0.0.1:5984/scrobbles > /dev/null 2>&1

# import scrobble json to couchdb
echo "importing scrobbles...\n"
cat tracks.json | couchimport --database scrobbles --type jsonl > /dev/null 2>&1

# clean up json
echo "cleaning up...\n"
rm *.json

echo "done!"