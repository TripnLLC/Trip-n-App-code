const admin = require('firebase-admin')
const serviceAccount = require('./tripn-f3722-firebase-adminsdk-c1n6j-ec1d39cc88.json')

const adminInitApp = () => {
    let defaultApp

    if(!admin.apps.length){
        defaultApp = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        })
    }else{
        defaultApp = admin.app()
    }

    return defaultApp
}

module.exports = {
    adminInitApp,
}