var app = angular.module('myapp', ['ngRoute']);

app.config(function($routeProvider){

    $routeProvider
    .when('/', {
        templateUrl:'views/login.html',
        controller: 'logincontroller'
    })

    .when('/createusers', {
        templateUrl: 'views/createUser.html',
        controller: 'createcontroller'
    })

    .when('/homepage',{
        templateUrl: 'views/homepage.html',
        controller: 'homecontrol',
        resolve:['checkUser', function(checkUser){
            return checkUser.checkValid();
        }]
    })

    .when('/postjobs', {
        templateUrl: 'views/postjobs.html',
        controller: 'postjobscontroller',
         resolve:['checkUser', function(checkUser){
            return checkUser.checkValid();
        }]
    })
    .when('/searchjobs', {
        templateUrl: 'views/searchjobs.html',
        controller: 'searchcontroller',
         resolve:['checkUser', function(checkUser){
            return checkUser.checkValid();
        }]
        
    })
    .when('/logout', {
        templateUrl:'views/login.html',
        controller:'logoutcontroller',
        resolve:['checkUser', function(checkUser){
            return checkUser.checkValid();
        }]
    })
    .when('/error',{
        template:'<h1 style="color:red; text-align:center">Invalid Page Request!</h1>'
    })
    .otherwise('/error',{})
});

//This service is used to find the logged in User
//and update his Logged in value to true// 
app.service('logUser', function($http){

    this.loginUser = function(usr_flag){
        $http.put('http://localhost:1000/ChangeLog/'+usr_flag.user+'/'+usr_flag.pass, usr_flag)
        .then(function(data){
            console.log(usr_flag.user, usr_flag.pass);
            if(data){
                var d1 = data.data;
                console.log(data.data);
                console.log("Data modified!, User log changed!");
            }else{
                console.log("error changing the values");
            }
        });
    }
});

//This Factory function is used to check, whether if any user is 
//logged in or not, if not then redirect to login page.
app.factory('checkUser', function($rootScope, $http, $q, $location){
   
    return{
        checkValid: function(){
            var promise = $q.defer();
           $http.get('http://localhost:1000/checkBool')
            .then(function(res){
                if(res.data.User===null){
                    console.log("Yes");
                    $location.path('/');
                    promise.reject("Error");
                    console.log("No user found!");
                }else{
                    console.log("Got the User!: ",res.data);
                    promise.resolve(res.data);
                    var d1 = res.data;
                }
                $rootScope.user = d1;
        });
        return promise.promise;
        }
    };
    
    });

//When the user is logging out, then it will set the logged in
//value to false as logged out!//
app.service('unlogUser', function($http, $location){

    this.unlog = function(users){
        /* var u1 = users.User.userrname;
        var p1 = users.User.password; */
        $http.put('http://localhost:1000/removeLog/', users)
        .then(function(res){
            if(res.data.flg == 'success'){
                console.log("True, Data modified!");
                console.log(res.data.user);
                $location.path('/');

            }else{
                console.log("Modification not successfull!");
            }
        })
    }
});

//Create controller for creating a new user!//
app.controller('createcontroller', function($scope, $location, $http){

    $scope.regUser = function(){
        console.log($scope.newUser);
        $http.post('http://localhost:1000/createusers', $scope.newUser)
        .then(function(res){
            console.log(res.data);
        });
        $location.path('/');
    }
    });

//This controller is for login//
app.controller('logincontroller', function($scope, logUser, $location, $http){

$scope.register = function(){
    console.log("true");
    $location.path('/createusers');
}
$scope.login = function(user){
    //console.log(user);
    $http.post('http://localhost:1000/loginAuth',$scope.user)
    .then(function(res){
        if(res.data.users){
        console.log("Got data!");
        $location.path('/homepage');
        usr_flag = {
            user:res.data.users.username,
            pass:res.data.users.password,
            type:res.data.users.usertype,
            flag: true
        };
        console.log(usr_flag);

        logUser.loginUser(usr_flag);
        }
        else{
            document.getElementById('notify').innerHTML = "Incorrect Username or password";
        }
    });
}
    $scope.regUser = function(newUser){
        console.log(newUser);
    }
});

//This is a homepage controller//
app.controller('homecontrol', function($scope, $rootScope, checkUser){
    $rootScope.user1 = $rootScope.user;
    $scope.uname = $rootScope.user1.User.username;
    $scope.usertype = $rootScope.user1.User.usertype;
    console.log($scope.uname);
    console.log($scope.usertype);
});

//This is the postjobs page controller//
app.controller('postjobscontroller', function($scope, $rootScope, checkUser, $location, $http){
 
    $location.path('/postjobs');

    var keyarr = 0;
    $scope.save_job = function(post){
        console.log(post);
        keyarr = [];        
        job = {
            title: $scope.post.title,
            description:$scope.post.description,
            keywords:$scope.post.keywords.split(','),
            location:$scope.post.location
        };
        console.log(keyarr);
        $http.post('http://localhost:1000/postjobs', job)
        .then(function(err, res){
            if(err){
                console.log("Error occurred during post!!", err);
            }else{
                console.log(res.data);
            }
        });
        document.getElementById('notify').innerHTML = "Job Posted!";
        $location.path('/homepage');
    }
});

//This is the search jobs page controller//
app.controller('searchcontroller', function($scope, checkUser,  $location, $http){
  
    checkUser.checkValid();

    $location.path('/searchjobs');

    $scope.reset = function(){
        $scope.sjobs.title = "";
        $scope.sjobs.keywords = "";
        $scope.sjobs.location = "";
        document.getElementById('dcontent').innerHTML = "";
    }

    $scope.search_job = function(sjobs){
        if(sjobs){
        document.getElementById('dcontent').innerHTML = "";
        console.log(sjobs);
        var str = "";
        $http.post('http://localhost:1000/searchJob', $scope.sjobs)
        .then(function(res){
                console.log(res.data);
                if(res.data){
                    console.log("got data!!");
                    console.log("No of matched results: ",res.data.jobs);
                for(job in res.data.jobs){
                   str += "<h4>"+"<strong>Title: </strong>"+res.data.jobs[job].title+"</h4>"+
                                "<strong>Description: </strong>"+res.data.jobs[job].description+"</h4>"+"<br>"+
                                 "<strong>Location: </strong>"+res.data.jobs[job].location+"</h4>"+"<br>"+
                                 "<strong>Keywords: </strong>"+res.data.jobs[job].keywords+"</h4>"+"<br>"+"<br>";
                }
                $scope.display == true;
                document.getElementById('dcontent').innerHTML = str;
                }else{
                    document.getElementById('dcontent').innerHTML = "";
                    console.log("Error loading the jobs!");
                }
        });
    }else{
        document.getElementById('dcontent').innerHTML = "<h1>No Jobs Found!</h1>"
    }
    }
});
//This is the logout controller//
app.controller('logoutcontroller', function($scope, $rootScope, unlogUser, checkUser){

    $rootScope.user1 = $rootScope.user;
     unlogUser.unlog($rootScope.user1);

});