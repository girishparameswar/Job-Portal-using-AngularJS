var express=require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var app = express();
app.use(express.static('public'));//files which are just needed for view.

app.use(bodyParser.json()); //converts json format to string format

mongoose.connect('mongodb://localhost/test');

var db = mongoose.connection;

db.on('error', function(){
    console.log('Connection failed!');
});

db.on('open', function() {
    console.log('connection established!!!');
});

var userSchema = mongoose.Schema({
    username: {
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    email: {
        type:String,
        required:true
    },
    location:{
        type:String,
        required:true
    },
    phone: {
        type:Number,
        required:true
    },
    usertype: {
        type:String,
        required:true
    },
    islogged: {
        default:false,
        type:Boolean,
        required:true
    }
});

var User = mongoose.model('users', userSchema);

var jobsSchema = mongoose.Schema({

    title:{
       type:String, 
       required: true
    },
    description:{
        type:String,
        required:true
    },
    keywords:{
        type:Array,
        required:true
    },
    location:{
        type:String,
        required:true
    } 
});

var Jobs = mongoose.model('PostedJobs', jobsSchema);

//Goes to default page at index.html//
app.get('/', function(req, res){
    res.sendFile(__dirname+'/index.html');
});


//For checking the login credentials when logged in!//
app.post('/loginAuth', function(req, res){
    console.log(req.body);
      User.findOne({username:req.body.name,
                   password:req.body.password},function(err, docs){
      if(err){
         console.error(err);
      }else{
          if(docs)
          res.json({'users':docs});
          else{
              res.send({'users':null});
          }
      }
  });
});


//This API is used to check whether user is logged in or not by its boolean value!
//If not, it will redirect to the Login page.//
app.get('/checkBool', function(req,res){

    User.findOne({islogged:true}, function(err, docs){
        if(err){
            console.log("error!", err);
        }else{
            res.json({'User':docs});
        }
    })
});


//This API is used to changing the value of the logged in User to True!//
app.put('/ChangeLog/:user/:pass', function(req, res){
    var user1 = req.params.user;
    var pass1 = req.params.pass;
    User.findOneAndUpdate({username:user1,
                           password:pass1},{"islogged":true},
                           function(err, docs){
        if(err){
            console.log("Error getting the users");
        }else{
            res.json(docs);
        }
    });
});

//This API is used for setting the logged value to false as the user logges out!//
app.put('/removeLog/', function(req, res){
    var u2 = req.body.User.username;
    User.update({username:u2},
                         {$set: {"islogged":false}}, function(err, docs){
                            if(err){
                                console.log("error updating the user value!");
                                
                            }else{
                                res.send({'flg':'success','user':docs});
                                console.log("The data:",docs);
                                
                            }

                          });
});

//for finding posted jobs.//
app.get('/postedjobs', function(req, res){

    Jobs.find({}, function(err, docs){
        if(err){
            console.log("collection not Found!", err);
        }else{
            res.json(docs);
        }
    });
});

//For searching the jobs //
app.post('/searchJob', function(req,res){
    console.log(req.body);
    Jobs.find({$text: {$search: req.body.title+" "+req.body.location+" "+req.body.keywords}}
        ,function(err, docs){
        if(err){
           console.log(err);
        }else{
            if(docs)
            res.json({'jobs':docs});
            else{
                res.send({'jobs':null});
            }
        }
    }); 
});

//Creating a new instance of user by create Users//
app.post('/createusers', function(req, res){

    console.log(req.body);
    var user1 = new User(req.body);
    user1.save();
});

//Creating a instance of user flag when logged in!//
app.post('/', function(req, res){
    console.log(req.body);
    var flag = new uFlag(req.body);
    flag.save();
})

//Creating a instance of posted job//
app.post('/postjobs', function(req, res){
    console.log(req.body);
    var job1 = new Jobs(req.body);
    job1.save();
});

//Creating a localhost server with port no:1000//
app.listen(1000, function(){
    console.log('Backend Running at localhost:1000');
});