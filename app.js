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


const verify = async (req)=>{
    verificador = await userModel.findOne(req)
    return(verificador)
}

const mostrar = async ()=>{
    
    const usuarios = await userModel.find()
    
    return (usuarios)

}

//actualizar

const actualizar = async(id, new_data)=>{

    const user_act = await userModel.updateOne({
        
        id: id
    
        }, 
        {
        
        $set: new_data

        })

    return true

}

//delete

const eliminar = async(id_delete)=>{
    const for_delete = await userModel.deleteOne({id: id_delete})
    
    return true

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
        req.body.id = uuid(); // se le asigna id
        userModel.create(req.body); //crea usuario
        return res.json({code: 301})

        
    }
}
)
})

/*/
// Update

app.post("/update", [],(req, res)=>{
    actualizar(req.body.id, req.body).then((val)=>{
        res.send("OK ACTUALIZADO")

    })

    
    
}
)

/*/

// Delete
//app.delete()


// Escuchando......


app.listen(3000, ()=>{
    console.log("server up")
})

