const express = require("express")
const mongoose = require("mongoose");

const app = express()
const url = "mongodb://127.0.0.1:27017/form" 

mongoose.set("strictQuery", false)
mongoose.connect(url,{useNewUrlParser: true})

.then(()=>console.log("connected to mongo"))
.catch((e)=>console.log("error de conexión es: "+ e));

const userSchema = mongoose.Schema({
    user: String,
    password: String

})


const {body, validationResult} = require("express-validator");
const { response } = require("express");
const userModel = mongoose.model("user", userSchema)


const verify = async (req)=>{
    verificador = await userModel.findOne(req)
    //console.log(verificador) 
    return(verificador)
}






app.use(express.json())
app.set("view engine","ejs")
app.use(express.urlencoded({extended:true}))


app.get("/",(req,res)=>{
    res.render("index")
})

app.post("/ingresar", [
    
    body("user","Ingrese user correcto")
        .exists()
        .isLength({min:5}),

    body("password", "Ingrese password valida")
        .exists()
        .isLength({min:5})

],(req, res)=>{

    const error = validationResult(req)

    if(!error.isEmpty()){
        console.log(req.body)
        const valores = req.body
        const validaciones = error.array()
        res.render("index",{validaciones:validaciones, valores: valores})
    }else{

        verify(req.body).then((val) => {
            if(val!==null){
                res.send("existe");

            }else{
                res.send("no existe")
            }
            
        })
    
    }          

    })




app.listen(3000, ()=>{
    console.log("server up")
})

