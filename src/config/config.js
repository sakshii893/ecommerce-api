const mongoose = require('mongoose')

async function connect(){
    mongoose.connect("mongodb://0.0.0.0/ecommerceapi")

    console.log("connected");
    
}

connect()

module.exports = mongoose.connection



