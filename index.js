var express = require('express');
var app = express();
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

//for mongodb
const MongoClient=require('mongodb').MongoClient;
//connecting server file for AWT
let server = require('./server');
let config = require('./config');
let middleware = require('./middleware');
const response = require('express');

// DATABASE CONNECTION
const url='mongodb://127.0.0.1:27017';
const dbName='HospitalInventory';
let db

MongoClient.connect(url, { useUnifiedTopology: true}, (err,client)=>{
    if(err) return console.log(err);
    db=client.db(dbName);
    console.log(`Connected Database: ${url}`);
    console.log(`Database : ${dbName}`);
});

//FETCHING HOSPITAL DETAILS
app.get('/hospitaldetails',middleware.checkToken,function(req,res) {
    console.log("Fetching data from Hospital collection");
    var data = db.collection('Hospital').find().toArray().then(result => res.json(result));
});

//VENTILATOR DETAILS
app.get('/ventilatordetails',middleware.checkToken,(req,res) => {
    console.log("Ventilators Information");
    var vdata = db.collection('Ventilators').find().toArray().then(result => res.json(result));
});

//SEARCH VENTILATORS BY STATUS
app.post('/searchventbystatus',middleware.checkToken, (req, res) => {
    var status = req.body.status;
    console.log(status);
    var ventilatordetails = db.collection('Ventilators').find({"status": status}).toArray().then(result => res.json(result));
});

//SEARCH VENTILATORS BY HOSPITAL NAME
app.post('/searchventbyname',middleware.checkToken, (req, res) => {
    var name = req.query.name;
    console.log(name);
    var ventilatordetails = db.collection('Ventilators').find({'name':new RegExp(name, 'i')}).toArray().then(result => res.json(result));
});

//SEARCH HOSPITAL BY NAME
app.post('/searchhospbyname',middleware.checkToken, (req, res) => {
    var name = req.query.name;
    console.log(name);
    var hospitaldetails = db.collection('Hospital').find({'name':new RegExp(name, 'i')}).toArray().then(result => res.json(result));
});

//UPDATE VENTILATOR DETAILS
app.put('/updateventilator',middleware.checkToken,(req,res) => {
    var vId = {ventId: req.body.vId };
    console.log(vId);
    var newvalues = { $set: { status: req.body.status}};
    db.collection("Ventilators").updateOne(vId, newvalues, function(err, result){
        res.json('1 document updated');
        if (err) throw err;
    });
});

//ADD VENTILATOR
app.post('/addventilatorbyuser',middleware.checkToken, (req, res) => {
    var hId = req.body.hId;
    var vId=req.body.vId;
    var status=req.body.status;
    var name=req.body.name;

    var item = 
    {
        hId:hId, vId:vId, status:status, name:name
    };
    db.collection('Ventilators').insertOne(item, function(err, result){
        res.json('Item Inserted');
    });
});

//DELETE VENTILATOR BY VENTILATOR ID
app.delete('/delete',middleware.checkToken,(req,res) => {
    var myquery = req.query.vId;
    console.log(myquery);

    var myquery1 = {vId: myquery};
    db.collection('Ventilators').deleteOne(myquery1, function (err, obj)
    {
        if(err) throw err;
        res.json("1 document deleted");
    });
});
app.listen(3000);