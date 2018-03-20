# Aggregate a number of rss podcast feeds into one feed

pjay - podcast jockey

To deploy to Heroku:
(from root folder)
git subtree push --prefix server heroku master

To set the environment variables for the firebase service account private key and email:
* Download the service account file from the firebase admin sdk console:
  * https://console.firebase.google.com/project/pjay-x/settings/serviceaccounts/adminsdk
* Open the file and copy the values for private_key and client_email into environment variables locally 
  * export FIREBASE_PRIVATE_KEY="{key string from file here}"
  * export FIREBASE_CLIENT_EMAIL="{email string from file here}"

To deploy just the server folder to Heroku:
* cd to root folder
* git subtree push --prefix server heroku master
* To set the environment variables on heroku:
  * heroku config:set FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL
  * heroku config:set FIREBASE_PRIVATE_KEY="$FIREBASE_PRIVATE_KEY"