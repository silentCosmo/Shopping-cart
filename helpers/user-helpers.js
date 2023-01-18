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
    doSignup: (userData) => {
        return new Promise(async (resolve, reject) => {
            userData.Password = await bcrypt.hash(userData.Password, 10)
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data) => {
                resolve(data.ops[0])
            })

        })

    },
    doLogin: (userData) => {
        let loginStatus = false
        let response = {}
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(collection.USER_COLLECTION).findOne({ Email: userData.Email })
            if (userData.Email === 'cosmo@admin.com') {
                if (userData.Password === 'admin') {
                    resolve({ adminlog: true })
                }
            } else
                if (user) {
                    bcrypt.compare(userData.Password, user.Password).then((status) => {
                        if (status) {
                            console.log('Login Successs');
                            response.user = user
                            response.status = true
                            resolve(response)
                        } else {
                            console.log('Wrong password!');
                            resolve({ status: false })
                        }

                    })
                } else {
                    console.log('No user found with the email');
                    resolve({ status: false })
                }
        })
    },
    addToCart: (proId, userId) => {
        let proObj = {
            item: objectId(proId),
            quantity: 1
        }
        return new Promise(async (resolve, reject) => {
            let userCart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (userCart) {
                let prodExist = userCart.products.findIndex(product => product.item == proId)
                console.log(prodExist);
                if (prodExist != -1) {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId), 'products.item': objectId(proId) },
                        {
                            $inc: { 'products.$.quantity': 1 }
                        }).then(() => {
                            resolve()
                        })
                } else {
                    db.get().collection(collection.CART_COLLECTION).updateOne({ user: objectId(userId) }, {

                        $push: { products: proObj }


                    }).then((response) => {
                        console.log(response);
                        resolve()
                    })
                }
            } else {
                let cartObj = {
                    user: objectId(userId),
                    products: [proObj]
                }
                db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response) => {
                    resolve()
                })
            }
        })
    },
    getCartProducts: (userId) => {
        return new Promise(async (resolve, reject) => {
            let cartItems = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            //console.log(cartItems[1].products)
            resolve(cartItems)
        })
    },
    getCartCount: (userId) => {
        return new Promise(async (resolve, reject) => {
            let count = 0
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            if (cart) {
                count = cart.products.length
            }
            resolve(count)
        })
    },
    changeProductQuantity: (details) => {
        details.count = parseInt(details.count)
        details.quantity = parseInt(details.quantity)
        return new Promise((resolve, reject) => {
            if (details.count == -1 && details.quantity == 1) {
                db.get().collection(collection.CART_COLLECTION)
                    .updateOne({ _id: objectId(details.cart) },
                        {
                            $pull: { products: { item: objectId(details.product) } }
                        }
                    ).then((response) => {
                        resolve({ removeProduct: true })
                        console.log('remove called')
                    })
            } else {
                db.get().collection(collection.CART_COLLECTION).updateOne({ _id: objectId(details.cart), 'products.item': objectId(details.product) },
                    {
                        $inc: { 'products.$.quantity': details.count }

                    }).then((response) => {
                        console.log('Adding quantity');
                        resolve({ status: true })
                    })
            }
        })
    },
    removeFromCart: (details) => {
        return new Promise((resolve, reject) => {
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: objectId(details.cart) },
                    {
                        $pull: { products: { item: objectId(details.product) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true })
                    console.log('remove called');
                })
        })
    },
    getTotalAmount: (userId) => {
        console.log('user: ' + userId);
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match: { user: objectId(userId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                },
                {
                    $project: {
                        //_id:null,
                        total: { $sum: { $multiply: ['$quantity', { $toInt: '$product.Price' }] } }
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: { $sum: '$total' }
                    }
                }
            ]).toArray()
            console.log(total);
            //console.log(total[0].total)
            resolve(total[0].total)
        })
    },
    placeOrder: (order, products, total) => {
        return new Promise((resolve, reject) => {
            console.log(order, products, total)
            let status = order['payment-method'] === 'COD' ? 'Placed' : 'pending'
            let orderObj = {
                deliveryDetails: {
                    address: order.address,
                    pin: order.pin,
                    mobile: order.mobile
                },
                userId: objectId(order.user),
                products: products,
                PaymentMethod: order['payment-method'],
                totalAmount: total,
                status: status,
                date: new Date()
            }

            db.get().collection(collection.ORDER_COLLECTION).insertOne(orderObj).then((response) => {
                db.get().collection(collection.CART_COLLECTION).removeOne({ user: objectId(order.user) })
                resolve(response.ops[0]._id)
            })
        })

    },
    getCartProductList: (userId) => {
        console.log(userId);
        return new Promise(async (resolve, reject) => {
            let cart = await db.get().collection(collection.CART_COLLECTION).findOne({ user: objectId(userId) })
            console.log(cart)
            resolve(cart.products)
        })
    },
    getUserOrders: (userId) => {
        console.log(userId)
        //console.log('uid '+user);
        return new Promise(async (resolve, rejet) => {
            let orders = await db.get().collection(collection.ORDER_COLLECTION).find({ userId: objectId(userId) }).toArray()
            console.log(orders)
            resolve(orders)

        })
    },
    getOrderProducts: (orderId) => {
        return new Promise(async (resolve, reject) => {
            let orderItems = await db.get().collection(collection.ORDER_COLLECTION).aggregate([
                {
                    $match: { _id: objectId(orderId) }
                },
                {
                    $unwind: '$products'
                },
                {
                    $project: {
                        item: '$products.item',
                        quantity: '$products.quantity'
                    }
                },
                {
                    $lookup: {
                        from: collection.PRODUCT_COLLECTION,
                        localField: 'item',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $project: {
                        item: 1, quantity: 1, product: { $arrayElemAt: ['$product', 0] }
                    }
                }
            ]).toArray()
            console.log(orderItems)
            resolve(orderItems)
        })
    },
    generatePayuOrder: (orderId) => {
        return new Promise((resolve, reject) => {

            const payu = require("pay-u").newOrder,
          // for ease of usage we will be using express.
          app = require("express")();
 
    // Putting all our stuff in the root route.
    app.get("/", (req, res) => {
        payu.Create({            
            amount: 2000,
            productinfo: 'None',
            firstname: 'Rj',
            email: 'rjwork333@gmail.com',
            phone: '9090909090',
            surl: 'http://localhost:1337/success',
            furl: 'http://localhost:1337/failure',
            service_provider: 'payu_paisa'
        },/* false === test payment*/ false);
        
        payu.sendReq()
        .then(url => {
    	    res.redirect(url);
    	})
    	.catch(err => {
        	res.send(err);
    	});
    });
    
    // Path to success :D, YAY!
    app.post("/success", (req, res) => {
        res.send("Success!")
    });
    
    // :P My payment failed!
    app.post("/failure", (req, res) => {
        res.send("OOPS payment failed!")
    });
    
    app.listen(1337, () => {
        console.log("Don't go to http://localhost:1337");
    });

        
        })

    }


}