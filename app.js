const express = require("express")
const mongoose = require("mongoose");
const crypto = require("crypto");
const {v4: uuid} = require("uuid");
const {body, validationResult} = require("express-validator");
const { response } = require("express");
const app = express()
const url = "mongodb://127.0.0.1:27017/form" 

mongoose.set("strictQuery", false)
mongoose.connect(url,{useNewUrlParser: true})

.then(()=>console.log("connected to mongo"))
.catch((e)=>console.log("error de conexión es: "+ e));

const userSchema = mongoose.Schema({
    id: String,
    user: String,
    password: String,
    type: String

})



const userModel = mongoose.model("users", userSchema, "users")



const sesionSchema = mongoose.Schema({
    user: String,
    id: String,
    private_key: Object

})

const sesionModel = mongoose.model("sesion", sesionSchema, "sesion")


// verificador

const verify = async (req)=>{
    verificador = await userModel.findOne(req)
    return(verificador)
}


// view

const mostrar = async ()=>{
    
    const usuarios = await userModel.find()
    
    return (usuarios)

}





app.use(express.json())
app.use(express.urlencoded({extended:true}))


//VIEW 

app.get("/admin",(req, res)=>{
    var users = [];

    mostrar().then((val)=>{ //mandar solo lo necesario
        //console.log(val)
        for(var i = 0; i < val.length; i++){
            users.push({user: val[i].user, id: val[i].id, type: val[i].type})

        }
        
        //console.log(users)
        res.send(users)
    })
    
    
});


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
            
            if(val.type=='admin'){
                return res.json({code: 202});

            }else{
                return res.json({code: 200});

            }
            
        
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
        //usuario a crear está en req.body (no posee id)
        new_body = {user: req.body.user, password: req.body.password, id: uuid(), type: req.body.type}
        userModel.create(new_body); //crea usuario
        return res.json({code: 301})
            

        }
        

        
    }
)}
)


// Update
app.post('/update-user', function(req, res) {
    let body = req.body;

    userModel.updateOne({ id: body.id }, {
            
             $set: 
             
             {
                user: body.user,
                password: body.password,
            }



            
        },
        function(error, info) {
            if (error) {
                res.json({code: 400}); //no actualizado

            } else {
               res.json({code: 204}) // actualizado
            }
        }
    )
});

    


// Delete
app.post('/delete-user', function(req, res){
    let body = req.body;
    userModel.deleteOne({id: body.id},
    function(error, info) {
            if (error) {
                res.json({code: 400}) // no eliminado
            } else {
                res.json({code: 200}) // eliminado
            }
     

})

})



// usuario ingresado


app.post("/usersesion", [
    
    body("user","Ingrese user correcto")
        .exists(),
        

],(req, res)=>{

    verify(req.body).then((val) => 
    {
        if(val!==null){
            // generar sesion

            //console.log(val)
            

            const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
                modulusLength: 2048,
                });

            //console.log(privateKey)
    
            // guardar en mongo (user, id, privatekey)
            sesion = {
                user: val.user,
                id: val.id,
                private_key: privateKey // 
            }

            
            console.log(sesion)

            sesionModel.create(sesion)

            msj = {
                user: val.user,
                id: val.id,
                public_key: publicKey // 
            }


            return res.json(msj)
            //return res.json({code: 200});
         
        
        }else{
            return res.json({code: 201});
            
        }
            
        })





    
    })




// Escuchando......


app.listen(3000, ()=>{
    console.log("server up")
})

