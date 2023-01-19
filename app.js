const express = require("express")
const mongoose = require("mongoose");
const {v4: uuid} = require("uuid");


const app = express()
const url = "mongodb://127.0.0.1:27017/form" 

mongoose.set("strictQuery", false)
mongoose.connect(url,{useNewUrlParser: true})

.then(()=>console.log("connected to mongo"))
.catch((e)=>console.log("error de conexión es: "+ e));

const userSchema = mongoose.Schema({
    id: String,
    user: String,
    password: String

})


const {body, validationResult} = require("express-validator");
const { response } = require("express");
const userModel = mongoose.model("user", userSchema)

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
    var users = {};

    mostrar().then((val)=>{
        res.send(val)
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
            return res.json({code: 200});
            
        
        }else{
            return res.json({code: 201});
            
        }
            
        })
    })
/*/

    //usuario a crear está en req.body (no posee id)
    req.body.id = uuid(); // se le asigna id
    //userModel.create(req.body); //crea usuario
    return res.json({code: 301})
    /*/


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
        new_body = {user: req.body.user, password: req.body.password, id: uuid()}

        userModel.create(new_body); //crea usuario
        return res.json({code: 301})

        
    }
}
)
})

// Update
app.post('/update-user', function(req, res) {
    let body = req.body;

    userModel.updateOne({ id: body.id }, {
            $set: {
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


// Escuchando......


app.listen(3000, ()=>{
    console.log("server up")
})

