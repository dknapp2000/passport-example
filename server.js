'use strict';

const users = [
    { id: 1, fname: "Don", lname: "Knapp", password: "secret", email: "don@dknapp.com" },
    { id: 2, fname: "Frank", lname: "Moses", password: "secret", email: "frank@dknapp.com" },
    { id: 3, fname: "Sam", lname: "Knapp", password: "secret", email: "sam@dknapp.com" },
    { id: 4, fname: "Matt", lname: "Knapp", password: "secret", email: "matt@dknapp.com" },
];

const express = require( 'express' );
const session = require( 'express-session' );
const bodyParser = require( "body-parser" );
const flash = require( "connect-flash" );
const passport = require( "passport" );
const LocalStrategy = require( "passport-local" ).Strategy;
const path = require( "path" );
const morgan = require( "morgan" );

const app = express();

app.use( bodyParser.urlencoded( { "extended": false } ) );
app.use( session( { secret: "Toy boat", resave: true, saveUninitialized: true }));
app.use( flash() );
app.use( passport.initialize() );
app.use( passport.session() );
app.use( morgan("tiny") );

passport.serializeUser( function( user, done ) {
    console.log( "Serialize: ", user.id );
    done( null, user.id );
})

passport.deserializeUser( function( id, done ) {
    console.log( "Deserialize: ", users[id-1] );
    done( null, users[id-1] );
})

passport.use( "local", new LocalStrategy( function( user, password, done ) {
    console.log( "Authenticating: ", user, password );
    let entry = users.find( ( u ) => {
        return( u.email === user && u.password === password)
    })

    if ( entry ) {
        done( null, entry );
    } else {
        done( null, false );
    }
}))

function ensureAuth( req, res, next ) {
    if ( req. isAuthenticated() ) {
        next();
    } else {
        req.flash("info", "You must be logged in to acces this page." );
        res.redirect("/login");
    }
}
app.get("/", ensureAuth, function( req, res ) {
    res.sendFile( path.join( __dirname, "/views/Welcome.html" ) );
});

app.get( "/login", function( req, res ) {
    res.sendFile( path.join( __dirname, "/views/login.html" ) );
});

app.get( "/loggedin", function( req, res ) {
    //res.json( req.user );
    res.sendFile( path.join( __dirname, "/views/loggedin.html" ) );
});

app.get( "/loginfailed", function( req, res ) {
    req.logout();
    res.sendFile( path.join( __dirname, "./views/loginfailed.html" ) );
});

app.post("/login", passport.authenticate( "local", {
    successRedirect: "/loggedin",
    failureRedirect: "/loginfailed"
}));

app.get( "/logout", function( req, res ) {
    req.logout();
    res.redirect("/")
});

app.post( "/logout", function( req, res ) {
    req.logout();
    res.redirect("/")
});
app.listen(3001, function( ) {
    console.log( "Listening on 3001" );
})
