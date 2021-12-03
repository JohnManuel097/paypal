/*
Se importan las las librerias necesarias, asi como el sdk de paypal-
*/
const express = require("express");
const bodyParser = require("body-parser");
const engines = require("consolidate");
const paypal = require('paypal-rest-sdk');
const app = express();
app.engine("ejs",engines.ejs);
app.set("views","./views");
app.set("view engine", "ejs");

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended : true}));

/*
configuración se paypal, así como los id correspondientes.
*/
paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': 'AeGf6xHOq4PMV83ZMvO3Vs36NW9LSyZTUjW0eX42hqSpNZu3Uhw4d1__-IR440kqrE8TtWxnZxh4kaLN',
    'client_secret': 'EOKxrMXAUeTL-vhazfrRyWqoaEffYdYJ7m9IMIhQql2mj5asEsECTtnOwThUc_JPC2RCAj-B6O3gEGvG'
  });



  /*
  Index principal
  */
app.get("/",(req,res)=>{
res.render("index");
});
/*
Url, de paypal en la cual se crea el pago y se redirecciona al ejs correspondiente.
*/
app.get('/paypal',(req,res)=>{

    var create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "http://192.168.1.6:3000/success",
            "cancel_url": "http://192.168.1.6:3000/cancel"
        },
        "transactions": [{
            "item_list": {
                "items": [{
                    "name": "item",
                    "sku": "item",
                    "price": "1",
                    "currency": "USD",
                    "quantity": 1
                }]
            },
            "amount": {
                "currency": "USD",
                "total": "1"
            },
            "description": "Sientete comodo con estos productos de joyerias."
        }]
    };
    
    /*
    Función que crea el pago en formato json.
    */
    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            /*
            Se muestra el error, en caso de que haya uno.
            */
            throw error;
        } else {

            /*
            Se redirecciona a la url correspondiente.
            */
            res.redirect(payment.links[1].href);
        }
    });

});

/*
Url que contiene el html, que nos manda a esta pantalla en caso de que el pago sea exitoso.
*/
app.get('/success',(req,res)=>{
    var PayerID = req.query.PayerID;
    var paymentId = req.query.paymentId;
    var execute_payment_json = {
        "payer_id": PayerID,
        "transactions": [{
            "amount": {
                "currency": "USD",
                "total": "1.00"
            }
        }]
    };
    /*
    Se ejecuta el pago de paypal.
    */
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        if (error) {
            /*
            Se arroja el error, en caso de que haya.
            */
            throw error;
        } else {
            /*
            Se redirecciona a la pantalla de exito, en caso de que el pago sea exitosos.
            */
            res.render("success");
       
        }
    });

});

/*
Se redirecciona a la pantalla, de cancel, en caso de que el pago sea cancelado.
*/
app.get('cancel',(req,res)=>{
    res.render("cancel");

})

/*
Función que nos permite saber que el servidor esta corriendo en el puerto 3000
*/
app.listen(3000, ()=>{
console.log("Server is running");

})