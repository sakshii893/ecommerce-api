const express = require('express')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
const path = require('path')




const app = express()
require('./src/config/config')
const userModel = require('./src/models/usermodel')
const postmodel = require('./src/models/productmodel')

const upload = require('./src/multer/multer')
const usermodel = require('./src/models/usermodel')

app.use(express.static(path.join(__dirname,'public')))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())

app.get('/',function(req,res){
    res.send("hello hii ")
})


app.post("/register", function(req,res){

    const {name, email, password} = req.body

    bcrypt.genSalt(10,function(err,salt){
        bcrypt.hash(password,salt,async function(err,hash){

           let user = await userModel.create({
                name,
                email,
                password:hash
            })

            const token = jwt.sign({email},"secret")
            res.cookie("token",token)
            res.send(user)

        })
    })

   

})

app.post("/login",async function(req,res){

    let user = await userModel.findOne({email:req.body.email})

    if(!user){
        return res.send("something wrong")
    }

    bcrypt.compare(req.body.password,user.password,function(err,result){
        if(result){
            let token = jwt.sign({email:user.email},"secret")
            res.cookie('token',token)
            res.send("yes you can login")
        }
        else{
            return res.send("something wrong")

        }
    })

})


app.post('/products',isLoggedin, upload.array('images', 5),async function(req,res){
    



    const user = await usermodel.findOne({email:req.user.email})

    const {name,description,price,category} = req.body

    const image  = req.file.filename

     

 const post = await postmodel.create({
    name,
    description
    ,price
    ,category,
    images:image,
    user:user._id


 })

  user.posts.push(post._id)
  await user.save()

  res.send({user,post})



})

app.put('/products/:id',isLoggedin,upload.single("image"),async function(req,res){

  
    const user = await usermodel.findOne({email:req.user.email})

    const {name,description,price,category} = req.body

    const image  = req.file.filename

    const post = await postmodel.findOne({_id:req.params.id})
    if(!post){
        return res.send("no such post exists")
    }


    const newpost = await postmodel.findOneAndUpdate({_id:req.params.id},{name,description,price,category,images:image,user:user._id},{new:true})

    res.send(newpost)

})


app.delete('/products/:id',isLoggedin,async function (req,res) {
    const post = await postmodel.findOne({_id:req.params.id})
    if(!post){
        return res.send("no such post exists")
    }

  const deletedpost = await postmodel.findOneAndDelete({_id:req.params.id})

  res.send(deletedpost)

    
})


app.get('/products', isLoggedin, async function (req, res) {
    try {
        const posts = await postmodel.aggregate([
            {
                $match: {
                    category: {
                        $eq: 'cat'
                    }
                }
            }
        ]);

        res.send(posts);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
});




app.get('/allproducts',async function(req,res){
    
    const products =await postmodel.find()
    res.send(products)
})


function isLoggedin(req,res,next){

    if(!req.cookies.token) return res.redirect('/login')

        jwt.verify(req.cookies.token,"secret",function(err,decoded){
            if(err){
                res.cookie("token","")
               return res.redirect("/login")
            }

            req.user = decoded
            next() 
        })

}

app.listen(3000)