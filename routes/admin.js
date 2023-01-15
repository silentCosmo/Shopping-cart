var express = require('express');
const { removeAllProducts, deleteProduct } = require('../helpers/product-helpers');
const productHelpers = require('../helpers/product-helpers');
var router = express.Router();
var productHelper = require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  //res.send('respond with a resource');

  /*let products = [
    {
      name:"S22 Ultra",
      category:"Mobile",
      description:"The best Android phone than pixel",
      img:"https://m.media-amazon.com/images/I/71PvHfU+pwL._SL1500_.jpg"
    },
    {
      name:"IPhone 14 Pro Max",
      category:"Mobile",
      description:"This is the world best phone ever",
      img:"https://m.media-amazon.com/images/I/71yzJoE7WlL._SL1500_.jpg"
    },
    {
      name:"Note 9 Pro Max",
      category:"Mobile",
      description:"The best Redmi phone of 2020",
      img:"https://i02.appmifile.com/430_operator_in/30/01/2021/e95cb65d71fa8a1a5e7ee201e1a63d12!800x800!85.png"
    },
    {
      name:"Mi 11 Ultra",
      category:"Mobile",
      description:"The best Xiaomi phone of 2021",
      img:"https://i02.appmifile.com/362_operator_in/23/04/2021/b23987f4a6605e2f4be4562bd0149fd8!800x800!85.png"
    }
  ]*/
  productHelpers.getAllProducts().then((products)=>{
    /*console.log(products)*/
    res.render('admin/view-products',{products,admin:true})
  })
  
});

router.get('/add-product',(req,res)=>{
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

router.get('/removeall',(req,res)=>{
  productHelpers.removeAllProducts()
  /*console.log(res)*/
  res.end()
})

router.get('/delete-product/:id',(req,res)=>{
  let proId = req.params.id
  console.log(proId);
  productHelpers.deleteProduct(proId).then((response)=>{
    res.redirect('/admin/')
  })
})

router.get('/edit-product/:id',async (req,res)=>{
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

module.exports = router;
