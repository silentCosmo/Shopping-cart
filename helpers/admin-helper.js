var db = require('../config/connection')
var collection = require('../config/collection')
const bcrypt = require('bcrypt')
const { USER_COLLECTION, CART_COLLECTION } = require('../config/collection')
const { response } = require('../app')
const { use } = require('../routes/user')
const { resolve, reject } = require('promise')
//const Collection = require('mongodb/lib/collection')
const { createIndex } = require('mongodb/lib/operations/collection_ops')
const { log } = require('handlebars')
var objectId = require('mongodb').ObjectID

module.exports = {
    doSignup:(adminData)=>{
        return new Promise(async (resolve, reject) => {
            adminData.Password = await bcrypt.hash(adminData.Password, 10)
            db.get().collection(collection.ADMIN_COLLECTION).insertOne(adminData).then((data) => {
                resolve(data.ops[0])
            })
        })
    },
    doLogin: (adminData) => {
        let loginStatus = false
        let response = {}
        return new Promise(async (resolve, reject) => {
            let admin = await db.get().collection(collection.ADMIN_COLLECTION).findOne({ Email: adminData.Email })
                if (admin) {
                    bcrypt.compare(adminData.Password, admin.Password).then((status) => {
                        if (status) {
                            console.log('Login Successs');
                            response.admin = admin
                            response.status = true
                            console.log('resolve 34: '+response);
                            resolve(response)
                        } else {
                            console.log('Wrong password!');
                            
                            resolve({ status: false })
                            console.log('resolve 35: '+status);
                        }

                    })
                } else {
                    console.log('No Admin found with the email');
                    resolve({ status: false })
                }
        })
    }

}