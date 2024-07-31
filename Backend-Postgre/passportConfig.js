const LocalStrategy = require("passport-local").Strategy;
const {pool} = require("./dbConfig");
const bcrypt = require("bcrypt");

function initialize(passport){
    const authenticateUser=(user_name, password)=>
    {
        pool.query(
            {
                'SELECT * FROM app_users WHERE user_name = $1 AND password = $2', [user_name, password]
            }
        )
    }
}

passport.use(
    new LocalStrategy(
        {
            usernameField: "user_name",
            passwordField: "password"

        },
        authenticateUser
    );
    passport.serializeuser(user, done)=> done(null, user_id));

    passport.deserializeuser(id, done)=>{
        pool.query(
            'SELECT * FROM users WHERE id = $1', [user_id]
        )
    }
)