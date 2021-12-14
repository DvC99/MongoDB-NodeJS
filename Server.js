const express = require("express");
const mongoose = require("mongoose");
const sgMail = require('@sendgrid/mail')

const app = express();
const router = express.Router();

app.use(express.urlencoded({extended: true}));
app.use(express.json());

require('dotenv').config();
const apiKey = process.env.SENDGRID_API_KEY
sgMail.setApiKey(apiKey)


//Modelos
const PersonShema = require('./Models/Person.js');

//Connection DataBase
mongoose.connect("mongodb+srv://rot:1@mintic01.k4mvd.mongodb.net/ActividadesDB?retryWrites=true&w=majority");

//CRUD
router.get('/', (req,res) => {
    res.send("Ya se inicio la API");
})

router.get('/sendEmail', (req,res) =>{
    const msg = {
        to: req.body.destino, // Change to your recipient
        from: 'danielvalenciacordero2@gmail.com', // Change to your verified sender
        subject: req.body.asunto,
        text: req.body.mensaje,
        html: '<strong>and easy to do anywhere, even with Node.js</strong>',
    }
    sgMail
    .send(msg)
    .then(() => {
        res.send('Email sent')
    })
    .catch((error) => {
        res.send(error.message)
    })
})

router.get('/sendSMS', (req,res) =>{
    const accountSid = process.env.WILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN
    const client = require('twilio')(accountSid, authToken);
    client.messages
    .create({
        body: req.body.mensaje,
        from: '+19062845744',
        to: '+57'+req.body.destino
    })
    .then(message => {
        if(!message){
            res.status(404).send("No se encontro ningun mensaje");
        }else{
            res.send("El mensaje se envio con exito");
        }
        })
    .catch((error) => {
        res.send(error.message)
    })
})

router.get('/persona', (req,res) => {
    PersonShema.find(
        function(err,datos){
            if (err){
                console.log("Error leyendo los datos de la DB");
            }else{
                res.send(datos);
            }
        }
    )
})

router.post('/persona', (req,res) => {
    const nuevaPersona = new PersonShema({
        tipoDocument: req.body.tipoDocument,
        identity: req.body.identity,
        nombre: req.body.nombre,
        apellido: req.body.apellido,
        direccion: req.body.direccion,
        mail: req.body.mail,
        telefono: req.body.telefono,
        celular: req.body.celular,
        web: req.body.web,
        descripcion: req.body.descripcion
    });
    nuevaPersona.save(
        function(err,datos){
            if(err){
                console.log(err);
            }
            res.send("Se creo a la persona en la base de datos");
        }
    )
})

router.delete('/persona/:id?', (req, res) => {
    const id = req.params.id;
    PersonShema.findByIdAndDelete(id)
    .then(data => {
        if(!data){
            res.status(404).send("No se encontro una persona con ese ID");
        }else{
            res.send("Persona se elimino");
        }
    })
    .catch(err => {
        res.status(500).send("La persona con el id="+id+"no se ha podido eliminar")
    })
})

router.put('/persona/:id', (req,res) => {
    const id = req.params.id;
    PersonShema.findByIdAndUpdate(id, req.body, {useFindAndModify: false})
    .then(data => {
        if(!data){
            res.status(404).send("La persona que intento actualizar no se encontro")
        }else res.send("La persona ha sido actualizada")
    })
    .catch(err => {
        res.status(500).send("Error al acutualizar la persona con el id="+id);
    })
})


app.use(router);
app.listen(3000, () => {
    console.log("Servidor iniciado")
});