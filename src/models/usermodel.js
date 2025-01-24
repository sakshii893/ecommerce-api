const mongoose = require('mongoose')


const userSchema = mongoose.Schema({
    name:String,
    email:String,
    password:String,
    image:String,
    posts: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }],
        default: [] // Default value is an empty array
    },
   
})

module.exports = mongoose.model("user",userSchema)