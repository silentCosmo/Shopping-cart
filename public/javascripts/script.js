//const { response } = require("../../app")

function addToCart(proId){
    $.ajax({
        url:'/add-to-cart/'+proId,
        method:'get',
        success:(response)=>{
            if(response.status){
                let count = $('#cart-count').html()
                count = parseInt(count) + 1
                $('#cart-count').html(count)
            }
            //alert(response)
        }
    })
}

function changeQuantity(cartId,proId,userId,count){

    let quantity = parseInt(document.getElementById(proId).innerHTML)
        //count = parseInt(count)
        console.log(quantity)

        console.log("useID "+userId)
    $.ajax({
        url:'/change-product-quantity',
        data:{
            user:userId,
            cart:cartId,
            product:proId,
            count:count,
            quantity:quantity
        },
        method:'post',
        success:(response)=>{
            if(response.removeProduct){
                alert("Prodct removed from youre cart")
                location.reload()
            }else{
                console.log("resp: "+response)
                console.log(response.total)
                document.getElementById(proId).innerHTML = quantity + count
                document.getElementById('total').innerHTML = response.total
                
                //console.log(count)
                //console.log(quantity)
                
            }

        }
    })
}

function removeProduct(cartId,proId){
    console.log(proId);
    $.ajax({
        url:"/remove-from-cart",
        data:{
            cart:cartId,
            product:proId
        },
        method:'post',
        success:(response)=>{
            alert("Product Removed SuccessFully")
            location.reload()
        }
    })
}

$("#checkout-form").submit((e) => {
    e.preventDefault()
    $.ajax({
        url: '/place-order',
        method: 'post',
        data:$("#checkout-form").serialize(),
        success: (response) => {
            alert(response)
            if(response.status){
                location.href = '/order-placed'
            }
        }
    })
})

