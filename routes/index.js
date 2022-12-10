var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {

  let products = [
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
      description:"The best budget phone of 2020",
      img:"https://i02.appmifile.com/430_operator_in/30/01/2021/e95cb65d71fa8a1a5e7ee201e1a63d12!800x800!85.png"
    },
    {
      name:"Mi 11 Ultra",
      category:"Mobile",
      description:"The best Xiaomi phone of 2021",
      img:"https://i02.appmifile.com/362_operator_in/23/04/2021/b23987f4a6605e2f4be4562bd0149fd8!800x800!85.png"
    }
  ]

  res.render('index', {products});
});

module.exports = router;
