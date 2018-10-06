let express = require("express");
let cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
let app = express();
let PORT = 8080;
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
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

var users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "a"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "a"
  }
};

//------------------------------FUNCTIONS-----------------------------------

function generateRandomString(){
  return "12345".split('').map(function()
    {return 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'.charAt
    (Math.floor(62*Math.random()));}).join('') + Math.floor(9*Math.random());
  //random link generator found online at stackoverflow "https://stackoverflow.com/questions/1349404
  ///generate-random-string-characters-in-javascript/26682781"
};

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


//---------------------------------HOME--------------------------------

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    urls: urlsForUser(req.cookies.user_id)
  };
  res.render("urls_index", templateVars);
});

//the PUSH comes in here and now we update the url database to have the user id appended to the end of the url

app.post("/urls", (req, res) => {

  let shortURL = generateRandomString();
  let newlongURL = req.body.longURL;
  let userID = req.body.id

  //this will have the userID as another key value pair
  urlDatabase[shortURL] = {
    userID: userID,
    longURL: newlongURL,
    userID: res.cookie("user_id")
  };


  res.redirect('/urls');

});

//---------------------------------NEW--------------------------------


app.get("/urls/new", (req, res) => {

  let templateVars = {
    user: users[req.cookies["user_id"]]
  }

  res.render("urls_new",templateVars);
});

//When the user creates a new url it sends a post request to /urls

//---------------------------------URLS/:Id--------------------------------


app.get("/urls/:id", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id].longURL
  };
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  const urlInDataBase = urlDatabase[req.params.id]
  if (urlDatabase && urlInDataBase.userID === req.cookies.user_id){
    urlDatabase[req.params.id] = req.body.newURL
  }
  res.redirect("/urls");
});

//---------------------------------DELETE--------------------------------

app.post("/urls/:id/delete", (req, res) =>{
  const urlInDataBase = urlDatabase[req.params.id];
  if (urlInDataBase && urlInDataBase.userID === req.cookies.user_id) {
    delete urlDatabase[req.params.id];
  }
      res.redirect("/urls")

});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//---------------------------------REGISTER--------------------------------

app.get("/register", (req, res) => {
  res.render("registration_new");
});

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

  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: hashedPassword

  };
  res.cookie("user_id", randomID);
  res.redirect("/urls");
});

//--------------------------------LOGIN-------------------------------


app.get("/login", (req, res) =>{
  res.render("reg_login");
});

app.post("/login", (req, res) => {

  const user = getUserByEmail(req.body.email);


  if (!user){
    res.status(403).send('Email not registered');
    return
  }

  //if the password that is given does not equal the password stored
  if (!bcrypt.compareSync(req.body.password, user.password)){
    res.status(403).send('Incorrect password');
    return
  }

  res.cookie('user_id', user.id);
  res.redirect("/urls/new");
});

//---------------------------------LOGOUT--------------------------------

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});


app.listen(PORT, () => {
  console.log(`Wow! ${PORT} is such a nice port!`);
});