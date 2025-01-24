const mongoose = require('mongoose')


const productSchema = mongoose.Schema({
    name:String,
    description:String,
    price:{
        type:Number,
        required:true,
    },
    category:String,
    images:[{type:String}],
    user:{type:mongoose.Schema.Types.ObjectId,ref:"user"},
})

module.exports = mongoose.model("product",productSchema)