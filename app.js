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
    return(verificador)
}




app.use(express.json())
app.use(express.urlencoded({extended:true}))




//LOGIN

app.post("/ingresar", [
    
    body("user","Ingrese user correcto")
        .exists(),
        

    body("password", "Ingrese password valida")
        .exists()

],(req, res)=>{

    verify(req.body).then((val) => 
    {
        if(val!==null){
            return res.json({code: 200});
            
            

        }else{
            return res.json({code: 201});
            
        }
            
        })
    })



//REGISTER

app.post("/register", [
    
    body("user","Ingrese user de mas de 5 caracteres")
        .exists(),

    body("password", "Ingrese password de mas de 5 caracteres")
        .exists()
        
],(req, res)=>{

    
    verify(req.body).then((val) => {
    if(val!==null){
        return res.json({code: 300}); ////este usuario ya existe

    }else{
        userModel.create(req.body); //crea usuario
        return res.json({code: 301})

        
    }
}
)
})





// Escuchando......


app.listen(3000, ()=>{
    console.log("server up")
})

