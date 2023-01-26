const express = require("express")
const mongoose = require("mongoose");

const crypto = require("crypto");

const bycrypt = require("bcryptjs")

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
    password: {
        type: String,
        bycrypt: true

    },
    
    type: String

})



userSchema.plugin(require("mongoose-bcrypt"))


const userModel = mongoose.model("users", userSchema, "users")





const sesionSchema = mongoose.Schema({
    user: String,
    id: String,
    private_key: String,
    public_key: String

})

const sesionModel = mongoose.model("sesion", sesionSchema, "sesion")



// verificador

const verify = async (req)=>{
    verificador = await userModel.findOne(req)
    return(verificador)
}

const verify_sesion = async (req)=>{
    verificador = await sesionModel.findOne(req)
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


    // recibir y desencriptar
    usuario= req.body.user 
    encrypted = req.body.password

    //desencrpitar
    // para ello:
        //1.- recibir public y 
        //2.- encontrar private mediante la public
        //3.- desencriptar password con la private


    verify_sesion({user: req.body.user}).then((val) => {
        if(val!==null){
            //console.log(val)
            sesion_user= req.body.user
            sesion_password_encrypted= req.body.password
            sesion_privateKey= val.private_key


            Ciphertext = Buffer.from(sesion_password_encrypted, "base64")

            const decryptedData = crypto.privateDecrypt(
                {
                    key: sesion_privateKey,
                    padding: crypto.constants.RSA_PKCS1_PADDING, //padding for jsencrypt
                    
                },
            
                Ciphertext
            )
            
            
            sesion_password= decryptedData.toString() // desencriptada

            //console.log(sesion_password)

            //delete sesion

            sesionModel.deleteOne({user: sesion_user},

                function(error, info) {
                        if (error) {
                            res.json({code: 400}) // no eliminado
                        } else {
                            
            // fusionar user y password ingresada

            login_sesion = {user: sesion_user, password: sesion_password}

            // comprobar ingreso de la fusión



            verify({user: sesion_user}).then((val) => {
                if(val!==null){

                    //desencriptar y comprobar logindata

                    const passwordEnteredByUser = sesion_password
                    const hash = val.password
            
                    //console.log(hash)

                    bycrypt.compare(passwordEnteredByUser, hash, function(error, isMatch) {
                        if (error) {
                          throw error
                        } else if (!isMatch) {
                            return res.json({code: 201})
                        } else {
                            if(val.type=='admin'){
                                return res.json({code: 202});
                
                            }else{
                                return res.json({code: 200});
                
                            }
                        }
                      })
                    
                    
                
                }else{
                    return res.json({code: 201}); //no existe
                    
                }
                
                    
                })
                            

                        }
                 
            
            })



    
        }else{
            res.json({error: "no existe este usuario en sesión"})
                
    
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
    // recibir y desencriptar
    usuario= req.body.user 
    encrypted = req.body.password

    //desencrpitar
    // para ello:
        //1.- recibir public y 
        //2.- encontrar private mediante la public
        //3.- desencriptar password con la private


    verify_sesion({user: req.body.user}).then((val) => {
        if(val!==null){
            //console.log(val)
            sesion_user= req.body.user
            sesion_password_encrypted= req.body.password
            sesion_privateKey= val.private_key

            Ciphertext = Buffer.from(sesion_password_encrypted, "base64")

            const decryptedData = crypto.privateDecrypt(
                {
                    key: sesion_privateKey,

                    padding: crypto.constants.RSA_PKCS1_PADDING, //padding for jsencrypt
                    
                },
                Ciphertext
            )
            
            
            sesion_password= decryptedData.toString() // desencriptada

            //console.log(sesion_password)


            //delete sesion

            sesionModel.deleteOne({user: sesion_user},

                function(error, info) {
                        if (error) {
                            res.json({code: 400}) // no eliminado
                        } else {
                            
            // fusionar user y password ingresada

            register_sesion = {user: sesion_user, password: sesion_password}

            // comprobar ingreso de la fusión

            verify(register_sesion).then((val) => {
                if(val==null){
                    new_body = {user: sesion_user, password: sesion_password, type: req.body.type,  id: uuid()}
                    userModel.create(new_body); //crea usuario
                    return res.json({code: 301});
                    
                 
                }else{
                    return res.json({code: 201});
                    
                }
                
                    
                })
                            

                }
                 
            
            })



    
        }else{
            res.json({error: "no existe este usuario en sesión"})
                
    
            }
            
    
        })

    })


    





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



// sesion login


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

            publica= publicKey.export({
                type: "pkcs1",
                format: "pem",
              })
            
            privada= privateKey.export({
                type: "pkcs1",
                format: "pem",
              })
           
    
            // guardar en mongo (user, id, privatekey)
            sesion = {
                user: val.user,
                id: val.id,
                private_key: privada, // 
                public_key: publica
            }

            
            //console.log(sesion)

            sesionModel.create(sesion)

            msj = {
                user: val.user,
                id: val.id,
                public_key: publica // 
            }


            return res.json(msj)
            //return res.json({code: 200});
         
        
        }else{
            return res.json({code: 201});
            
        }
            
        })





    
    })


// sesion register

app.post("/usersesion_register", [
    
    body("user","Ingrese user correcto")
        .exists(),

        

],(req, res)=>{

    verify(req.body).then((val) => 
    {
        if(val==null){
            // generar sesion

            //console.log(val)
            

            const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
                modulusLength: 2048,
                });

            publica= publicKey.export({
                type: "pkcs1",
                format: "pem",
              })
            
            privada= privateKey.export({
                type: "pkcs1",
                format: "pem",
              })
           
    
            // guardar en mongo (user, id, privatekey)
            sesion = {
                user: req.body.user,
                private_key: privada, // 
                public_key: publica
            }

            
            //console.log(sesion)

            sesionModel.create(sesion)

            msj = {
                user: req.body.user,
                public_key: publica // 
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

