var express = require('express');
const { response } = require('../app');
const productHelpers = require('../helpers/product-helpers');
const { getTotalAmount } = require('../helpers/user-helpers');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers')


const verifyLogin = (req,res,next)=>{
  let loggedIn = req.session.loggedIn
  console.log('session: '+req.session);
  console.log('login2: '+req.session.user);
  if(req.session.user){
    next()
  }else{
    res.redirect('/login')
  }
}

/* GET home page. */
router.get('/',async function(req, res, next) {
    let user = req.session.user
    console.log(user);
    let cartCount = null
    if(req.session.user){
      cartCount = await userHelpers.getCartCount(req.session.user._id)
    }
    
  productHelpers.getAllProducts().then((products)=>{

    res.render('user/view-products',{products,user,cartCount})
  })
  /*res.render('index', {products,admin:false});*/
});

router.get('/signup',(req,res)=>{
  if(req.session.userloggedIn){
    res.redirect('/')
  }else{
    res.render('user/signup')
  }
})
router.post('/signup',(req,res)=>{
    userHelpers.doSignup(req.body).then((response)=>{
    console.log(response);
    req.session.user = response
    req.session.user.loggedIn=true
    res.redirect('/')
  })
  
  
})

router.get('/login',(req,res)=>{
  //console.log('getLog: '+req.session.user.loggedIn);
  if(req.session.userloggedIn){
    res.redirect('/')
  }else

    res.render('user/login',{"loginErr":req.session.userloginErr})
    req.session.userloginErr=false
  
})

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    /*if(response.adminlog){
      res.redirect('/admin')
    }else*/
    if(response.status){
      req.session.user = response.user
      req.session.user.loggedIn = true
      res.redirect('/')
    }else{
      req.session.userloginErr="Invalid Usernam or Password"
      res.redirect('/login')
    }
    
  })
  
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  //req.sesssion.user = null
  res.redirect('/')
})

router.get('/add-to-cart/:id',verifyLogin,(req,res)=>{
  console.log('Ajax is working!');
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    //res.redirect('/')
    res.json({status:true})
  })
})

router.get('/cart',verifyLogin,async(req,res)=>{
  let products = await userHelpers.getCartProducts(req.session.user._id)
  console.log(products);
  let totalValue = null;
  if (products.length > 0){
    let totalValue = await userHelpers.getTotalAmount(req.session.user._id)
    console.log(totalValue);
    res.render('user/cart',{products,user:req.session.user,totalValue})
  }else{
    res.render('user/empty-cart',{user:req.session.user})
  }
    
    
    
  
})

router.post('/change-product-quantity',(req,res,next)=>{
  console.log('qnty changed');
  userHelpers.changeProductQuantity(req.body).then(async(response)=>{
    response.total = await userHelpers.getTotalAmount(req.body.user)
    console.log("reques : "+req.body.user);
      res.json(response)
  })
})

router.post('/remove-from-cart',(req,res,next)=>{
  userHelpers.removeFromCart(req.body).then((response)=>{
    console.log(req.body);
    res.json(response)
  })
})

router.get('/place-order',verifyLogin, async(req,res)=>{
  let total = await userHelpers.getTotalAmount(req.session.user._id)
  console.log(total);
  res.render('user/place-order',{total,user:req.session.user})
})

router.post('/place-order',verifyLogin,async(req,res)=>{
  let products = await userHelpers.getCartProductList(req.body.user)
  let totalPrice = await userHelpers.getTotalAmount(req.body.user)
  console.log('bodyuser: '+req.body.user)
  userHelpers.placeOrder(req.body,products,totalPrice).then((orderId)=>{
    console.log(req.body);
    if(req.body['payment-method']=='COD'){
      res.json({status:true})
    }else{
      //res.send('Online payment under maintenance')
      userHelpers.generatePayuOrder(orderId).then((response)=>{
        
      })
    }
    
    
  })
  console.log(req.body);
})

router.get('/order-placed',verifyLogin,(req,res)=>{
  console.log(req.session.user._id);
  res.render('user/order-placed')
})

router.get('/orders',verifyLogin,async (req,res)=>{
  console.log(req.session.user._id)
  let orders = await userHelpers.getUserOrders(req.session.user._id)
  res.render('user/orders',{user:req.session.user,orders})
})

router.get('/view-order-products/:id',verifyLogin,async(req,res)=>{
  console.log('params: '+req.params.id);
  let products = await userHelpers.getOrderProducts(req.params.id)
  
  
  console.log('pro',products)

  res.render('user/view-order-products',{user:req.session.user,products})
})

router.get('/payment-demo',(req,res)=>{
  res.render('user/payment-demo')
})

module.exports = router;
