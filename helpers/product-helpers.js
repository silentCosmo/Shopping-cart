var db = require('../config/connection')
var collection = require('../config/collection')
const { response } = require('../app')
const { resolve } = require('promise')
var objectId = require('mongodb').ObjectID

module.exports = {

    addProduct:(product,callback,err)=>{
        console.log(product)
        db.get().collection(collection.PRODUCT_COLLECTION).insertOne(product).then((data)=>{
           //console.log(data)
            callback(data.ops[0]._id)
        })
        console.log(Price);
    },
    getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products = await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
    },
    removeAllProducts:()=>{
        db.get().collection(collection.PRODUCT_COLLECTION).drop()
        console.log("deleted successFully")
    },
    deleteProduct:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).removeOne({_id:objectId(proId)}).then((response)=>{
                resolve(response)
            })
        })
    },
    getProductDetails:(proId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:objectId(proId)}).then((product)=>{
                resolve(product)
            })
        })
    },
    updateProduct:(proId,proDetails)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).updateOne({_id:objectId(proId)},{
                $set:{
                    Name:proDetails.Name,
                    Category:proDetails.Category,
                    Description:proDetails.Description,
                    Price:parseInt(proDetails.Price)
                }
            }).then((response)=>{
                resolve()
            })
        })
    }

}