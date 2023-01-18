var express = require('express');
const { removeAllProducts, deleteProduct } = require('../helpers/product-helpers');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper = require('../helpers/product-helpers');
var adminHelpers = require('../helpers/admin-helper');



const verifyAdmin = (req,res,next)=>{
  console.log('admin: '+req.session.admin);
  if(req.session.adminloggedIn){
    next()
  }else{
    res.redirect('/admin/login')
  }
}

/* GET users listing. */
router.get('/',verifyAdmin, function(req, res, next) {
  //req.session.admin.loggedIn = false
  productHelpers.getAllProducts().then((products)=>{
    /*console.log(products)*/
    res.render('admin/view-products',{products,admin:true})
  })
  
});

router.get('/add-product',verifyAdmin,(req,res)=>{
  res.render('admin/add-product',{admin:true})
})

router.post('/add-product',(req,res)=>{
  /*console.log(req.body)
  console.log(req.files.Image)*/

  productHelper.addProduct(req.body,(id)=>{

    /*console.log(id)*/

    let image = req.files.Image
    image.mv('../Shopping-cart/public/product-images/'+id+'.jpg',(err,done)=>{
      if(!err){
        res.redirect("/admin/")
      }else{
        console.log(err)
      }
      
    })
  })
})

router.get('/removeall',verifyAdmin,(req,res)=>{
  productHelpers.removeAllProducts()
  /*console.log(res)*/
  res.end()
})

router.get('/delete-product/:id',verifyAdmin,(req,res)=>{
  let proId = req.params.id
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })
})

router.get('/edit-product/:id',verifyAdmin,async (req,res)=>{
  let product = await productHelpers.getProductDetails(req.params.id)
  console.log(product);
  console.log(product.Name);
  res.render('admin/edit-product',{product,admin:true})
})

router.post('/edit-product/:id',(req,res)=>{
  productHelpers.updateProduct(req.params.id,req.body).then(()=>{

    let id = req.params.id
    if(req.files.Image){
      let image = req.files.Image
    image.mv('../Shopping-cart/public/product-images/'+id+'.jpg')
    }

    res.redirect('/admin')
  })
  
})

router.get('/login',(req,res)=>{
  if(req.session.adminloggedIn){
    res.redirect('/admin')
  }else

    res.render('admin/login',{"loginErr":req.session.adminloginErr})
    req.session.adminloginErr=false
})

router.get('/admin-signup',(req,res)=>{
  if(req.session.adminloggedIn){
    res.redirect('/')
  }else{
    res.render('admin/signup')
  }
})

router.post('/signup',(req,res)=>{
  adminHelpers.doSignup(req.body).then((response)=>{
  console.log(response);
  req.session.admin = response
  req.session.admin.loggedIn=true
  res.redirect('/')
})
})

router.post('/login',(req,res)=>{
  adminHelpers.doLogin(req.body).then((response)=>{
    console.log('router Res: '+response.status);
    if(response.status){
      req.session.admin = response.admin
      req.session.adminloggedIn = true
      res.redirect('/admin')
    }else{
      
      req.session.adminloginErr="Invalid Admin or Password"

      res.redirect('/admin/login')
    }
    
  })
  
})

router.get('/logout',(req,res)=>{
  req.session.destroy()
  //req.sesssion.admin = null
  res.redirect('/admin')
})

module.exports = router;
