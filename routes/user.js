var express = require('express');
const { response } = require('../app');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
const userHelpers = require('../helpers/user-helpers')

const veryfyLogin = (req,res,next)=>{
  if(req.session.loggedIn){
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
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
    res.render('user/signup')
  }
})
router.post('/signup',(req,res)=>{
    userHelpers.doSignup(req.body).then((response)=>{
    console.log(response);
    req.session.loggedIn=true
    req.session.user = response
    res.redirect('/')
  })
  
  
})

router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else

    res.render('user/login',{"loginErr":req.session.loginErr})
    req.session.loginErr=false
  
})

router.post('/login',(req,res)=>{
  userHelpers.doLogin(req.body).then((response)=>{
    if(response.adminlog){
      res.redirect('/admin')
    }else
    if(response.status){
      req.session.loggedIn = true
      req.session.user = response.user
      res.redirect('/')
    }else{
      req.session.loginErr="Invalid Usernam or Password"
      res.redirect('/login')
    }
    
  })
  
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.get('/add-to-cart/:id',veryfyLogin,(req,res)=>{
  console.log('Ajax is working!');
  userHelpers.addToCart(req.params.id,req.session.user._id).then(()=>{
    //res.redirect('/')
    res.json({status:true})
  })
})

router.get('/cart',veryfyLogin,async(req,res)=>{
  let products = await userHelpers.getCartProducts(req.session.user._id)
  //console.log(products);
  res.render('user/cart',{products,user:req.session.user})
})

router.post('/change-product-quantity',(req,res,next)=>{
  userHelpers.changeProductQuantity(req.body),then(()=>{
      res.json({status:true})
  })
})

module.exports = router;
