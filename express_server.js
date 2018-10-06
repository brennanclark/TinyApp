
//-------------------------------------SETUP-------------------------------------

const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
let app = express();
let PORT = 8080;


app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession( {
  name: 'session',
  keys: ['theshinning']
}));
app.set("view engine", "ejs");

//---------------------------------------DATABASES-------------------------------

let urlDatabase = {
    "b2xVn2": {
    userID: "userRandomID",
    longURL: "http://www.lighthouselabs.ca"
  },
  "9sm5xK": {
    userID: "userRandomID",
    longURL: "http://www.google.com"
  }
};

let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("a", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("a", 10)
  }
};

//------------------------------FUNCTIONS-----------------------------------

//random id generator found online at stackoverflow "https://stackoverflow.com/questions/1349404
///generate-random-string-characters-in-javascript/26682781"

function generateRandomString(){
  return "12345".split('').map(function()
    {return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt
    (Math.floor(62*Math.random()));}).join('') + Math.floor(9*Math.random());
};

//given an email, returns the corrosponding user object.

function getUserByEmail (email) {
  for (let userID in users) {
    let user = users[userID];
    let existingEmail = user.email;
    if (email === existingEmail){
      return user;
    }
  }
  return undefined;
};

//finds all the urls corrosponding to the user making the request.

function urlsForUser(id) {
  const newObj = {};
  for (let key in urlDatabase) {
    const currentUserID = urlDatabase[key].userID
    if (currentUserID && currentUserID === id){
      newObj[key] =  urlDatabase[key];
    }
  }
  return newObj;
};


//---------------------------------/--/urls--------------------------------

//the root that redirects to login if not a user or to the urls page if you are logged in.

app.get("/", (req, res) => {
  if (req.session.user_id){
    res.redirect("/urls");
  }
  res.redirect("/login");
});

//redenrs the urls page. only logged in users will see urls on this page, and only theirs. Handled on front end.

app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    urls: urlsForUser(req.session.user_id)
  };
  res.render("urls_index", templateVars);
});

//posts a new url with the attatched userID of the user that made it.

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let newlongURL = req.body.longURL;
  let newURL = req.body.newURL;
  let userID = req.body.id

  urlDatabase[shortURL] = {
    userID: userID,
    longURL: newlongURL,
    userID: req.session.user_id
  };


  res.redirect('/urls/' + shortURL);

});

//---------------------------------NEW--------------------------------

//renders the new url to be shortened page. Hidden behind login wall on front end.

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  }
  res.render("urls_new",templateVars);
});


//---------------------------------URLS/:Id--------------------------------

//if urls/id is requested it renders the page with the corrosponding url information

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

//you can only edit and see a url that belongs to you

app.post("/urls/:id", (req, res) => {
  let urlInDataBase = urlDatabase[req.params.id]

  if (urlInDataBase.userID === req.session.user_id){
      urlInDataBase.longURL = req.body.newURL
      res.redirect("/urls");
  } else{
    res.send("You are not authorized to edit that URL!")
  }

});

//---------------------------------DELETE--------------------------------

//If the user that owns the short url deletes the post then it deletes it

app.post("/urls/:id/delete", (req, res) =>{
  const urlInDataBase = urlDatabase[req.params.id];
  if (urlInDataBase && urlInDataBase.userID === req.session.user_id) {
    delete urlDatabase[req.params.id];
  }
      res.redirect("/urls")

});

//-------------------------------/u/:shortURL------------------------------

app.get("/u/:shortURL", (req, res) => {

//if the shortened url exists then it redirects to the corrosponding web adress,
//else it returns an error

  if (urlDatabase[req.params.shortURL]){
    let sendURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(sendURL);
  } else{
    res.status(400).send("No URL with that id");
  }

});

//---------------------------------REGISTER--------------------------------

//if the user is signed in then it will redirect to urls,
// else it will show the registration page

app.get("/register", (req, res) => {

  if (!req.session.user_id){
    res.render("registration_new");
  } else {
    res.redirect("/urls")
  }

});

//takes the inut from the register form and generates a new random userID

app.post("/register", (req, res) => {
  let randomID = generateRandomString();
  let password = req.body.password
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send('Email or password empty');
    return
  }
  if (getUserByEmail(req.body.email))  {
    res.status(400).send('Email already exists');
    return
  }
//If all the checks come out clean then a new user is set with a random ID,
//the hashed password and the email
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: hashedPassword

  };
  req.session.user_id = randomID;
  res.redirect("/urls");
});

//--------------------------------LOGIN-------------------------------


app.get("/login", (req, res) =>{
  res.render("reg_login");
});


//checks if the user exists and if the password matches the stores hashed password
app.post("/login", (req, res) => {
  const user = getUserByEmail(req.body.email);

  if (!user){
    res.status(403).send('Email not registered');
  }
  if (!bcrypt.compareSync(req.body.password, user.password)){
    res.status(403).send('Incorrect password');
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});

//---------------------------------LOGOUT--------------------------------

//deletes your userID cookie
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//---------------------------------.json------------------------------------

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//-----------------------------LISTEN---------------------------------------


app.listen(PORT, () => {
  console.log(`Listening... Wow! ${PORT} is such a nice port!`);
});