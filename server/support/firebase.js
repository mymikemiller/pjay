var fs = require('fs');
var admin = require('firebase-admin');

module.exports = function(serviceAccountFilePath) {
    var module = {};

    /* Generate the service account key at https://console.firebase.google.com/project/tellomee-x/settings/serviceaccounts/adminsdk
        We would like to do the following, for example:
        var serviceAccount = require('./tellomee-x-firebase-adminsdk.json');
        But we can't require the service account key file when we have to deploy the git repo on Heroku, 
        so instead (if the file doesn't exist, which it shouldn't on the server (it's in .gitignore)), 
        we use environment variables and create the serviceAccount object using the values
        from the service account file from firebase.
    */
    var serviceAccount
    
    if (fs.existsSync(serviceAccountFilePath)) {
        serviceAccount = require("../" + serviceAccountFilePath);
    } else {
        if (!process.env.FIREBASE_PRIVATE_KEY ||
            !process.env.FIREBASE_CLIENT_EMAIL) {
                console.error("There is no service account file at path: " + serviceAccountFilePath + ". This is expected on the server. In that case, you must define FIREBASE_PRIVATE_KEY and FIREBASE_CLIENT_EMAIL with values from the file.")
                process.exit(1)
        }

        serviceAccount = {
            // The \n's in the private key string cause a failure to parse the private key when initializing, so we fix it up here according to:
            // https://stackoverflow.com/questions/41287108/deploying-firebase-app-with-service-account-to-heroku-environment-variables-wit
            "private_key": process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
            "client_email": process.env.FIREBASE_CLIENT_EMAIL,
        }
    }


    // This firebase stuff might need to move into /book
    // Initialize firebase for booking reservations
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://pjay-x.firebaseio.com"
    });
    // Get a database reference to our posts
    var db = admin.database();
    var funnelsRef = db.ref("funnels");

    module.getFeedURLs = function(funnelName) {
        return new Promise((resolve, reject) => {
            funnelsRef.child(funnelName).once("value", function(snapshot) {
                let funnel = snapshot.val();

                if (!funnel) {
                    reject("Funnel '" + funnelName + "' not found in database")
                } else {
                    console.log("got feeds")
                    console.log(funnel)
                    resolve(funnel)
                }
            })
            // request(feedURL, (err, res, data) => {
            //     if (err) {
            //       console.error('Network error', err);
            //       reject(err)
            //       return;
            //     }
               
            //     parsePodcast(data, (err, podcastData) => {
            //         if (err) {
            //             console.error('Parsing error', err);
            //             reject(err)
            //             return;
            //         }
                
            //         resolve(podcastData)
            //     });
            // });
        })

    }

    function privateFunction() {}
    
    return module;
};

