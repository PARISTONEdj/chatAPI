
var User = require("../models/user");

var bcrypt = require("bcrypt");

const jwt = require('jsonwebtoken');

var auth = require("../midlewars/auth");

module.exports = {
    register: function (req, res, next) {
        var email = req.body.email;
        var password = req.body.password;
        var username = req.body.username;
        var bio = req.body.bio;
    
        if (!email || !username || !password) {
          return res.status(400).json({ error: "Veuillez renseigner email, username et password" });
        } else {
          User.findOne({ email: email })
            .then(function (userfound) {
              if (userfound) {
                return res.status(409).json({ error: "L'utilisateur existe déjà" });
              } else {
                bcrypt.hash(password, 10, function (err, bcryptpassword) { // Utilisez 10 pour le coût du hachage
                  if (err) {
                    return res.status(500).json({ error: "Erreur lors du hachage du mot de passe" });
                  }
    
                  var newUser = new User({
                    email: email,
                    password: bcryptpassword,
                    username: username,
                    bio: bio,
                    isAdmin: false // Assurez-vous que c'est un booléen
                  });
    
                  newUser
                    .save()
                    .then(function (newUser) {
                      res.status(201).json({ "id" : newUser._id });
                    })
                    .catch(function (error) {
                      res.status(400).json({ error: error.message });
                    });
                });
              }
            })
            .catch(function (err) {
              return res.status(500).json({ error: "Erreur lors de la recherche de l'utilisateur" });
            });
        }
      },

      login: function (req, res, next) {
        // Récupérez l'email et le mot de passe à partir du corps de la requête
        var email = req.body.email;
        var password = req.body.password;
    
        // Vérifiez si l'email et le mot de passe ont été fournis
        if (!email || !password) {
            return res.status(400).json({ error: "Veuillez renseigner email et password" });
        } else {
            // Recherchez l'utilisateur dans la base de données par son email
            User.findOne({ email: email })
                .then(function (userfound) {
                    if (userfound) {
                        // Si l'utilisateur est trouvé, comparez le mot de passe haché
                        bcrypt.compare(password, userfound.password, function (errBycrypt, resBcrypt) {
                            if (resBcrypt) {
                                // Si le mot de passe correspond, renvoyez l'ID de l'utilisateur
                                return res.status(200).json({
                                    "userId": userfound._id,
                                    token : jwt.sign(
                                      { userId: userfound._id },
                                      'RANDOM_TOKEN_SECRET',
                                      { expiresIn: '7d' }
                                  )

                                });

                            } else {
                                // Si le mot de passe ne correspond pas, renvoyez une erreur
                                return res.status(403).json({ "error": "Mot de passe incorrect" });
                            }
                        });
                    } else {
                        // Si l'utilisateur n'est pas trouvé, renvoyez une erreur
                        return res.status(409).json({ "error": "L'utilisateur n'existe pas" });
                    }
                })
                .catch(function (err) {
                    // En cas d'erreur lors de la recherche de l'utilisateur, renvoyez une erreur
                    return res.status(500).json({ "error": "Impossible de vérifier l'utilisateur" });
                });
        }
    },

    liste : function(req, res, next){
      User.find()
      .then(users => res.status(200).json(users))
      .catch(error => res.status(400).json({ error }));
    },


    updateuser : function(req, res, next){
      var id = req.auth.userId;
      console.log("le parametre est : "+id);

      console.log(req.body.telephone);
      console.log(req.body);

      User.findOne({_id : id})
          .then(function(userfound){
            if(userfound){
              User.updateOne({_id : id}, {...req.body, _id : id})
                  .then(()=>res.status(200).json({"message" : "utilisateur modifier"}))
                  .catch(function(err){
                    return res.status(500).json({"error" : "Mise a jour echouer"});
                  })
            }
            else{
              return res.status(500).json({"error" : "utilisateur introuvable"});
            }
          })
          .catch(
            function(err){
              return res.status(500).json({ "error": "utilisateur introuvable" });
            }
          )
      

    },

    deleteuser : function(req, res, next){
      var id = req.params.id;
      if(id ==null){
        return res.status(400).json({"error" : "id nom trouver"})
      }
      else{
        User.findOne({_id : id})
            .then(function(userfound){
              if(userfound){
                User.deleteOne({_id : id})
                    .then(()=>res.status(200).json({"message" : "utilisateur supprimer"}))
                    .catch(function(err){
                      return res.status(500).json({"error" : "Echec suppression"})
                    })
              }
              else{
                return res.status(500).json({"error" : "Utilisateur introuvable"});
              }
            })
            .catch(
              function(err){
                return res.status(500).json({ "error": "utilisateur introuvable" });
              }
            )
      }
    },

    oneuser: function(req, res, next) {
      const userId = req.auth.userId;
      
      User
        .findById(userId) // Utilisez findById pour rechercher un utilisateur par ID
        .then(user => {
          if (!user) {
            // L'utilisateur n'a pas été trouvé
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
          }
          // L'utilisateur a été trouvé
          res.status(200).json(user);
        })
        .catch(error => {
          // Gérez les erreurs de manière appropriée
          console.error('Erreur lors de la recherche de l\'utilisateur :', error);
          res.status(500).json({ error: 'Erreur serveur' });
        });
    },

    logout : function(req, res, rest){
      res.clearCookie('token'); 
      res.status(200).json({ message: "Déconnexion réussie" });
    },

    updatePassword: function (req, res, next) {
      var newpassword = req.body.newpassword;
      var oldpassword = req.body.oldpassword;
      var id = req.auth.userId;
      console.log("le parametre est : " + id);
    
      console.log(newpassword + ' ' + oldpassword);
    
      User.findOne({ _id: id })
        .then(function (userfound) {
          if (userfound) {
            bcrypt.compare(oldpassword, userfound.password, function (errBycrypt, resBcrypt) {
              if (resBcrypt) {
                // Comparaison réussie, hacher le nouveau mot de passe
                bcrypt.hash(newpassword, 10, function (err, hash) {
                  if (err) {
                    return res.status(500).json({ "error": "Hachage du mot de passe échoué" });
                  }
                  // Mettre à jour le mot de passe haché
                  User.updateOne({ _id: id }, { password: hash })
                    .then(() => res.status(200).json({ "message": "Mot de passe mis à jour" }))
                    .catch(function (err) {
                      return res.status(500).json({ "error": "Mise à jour échouée" });
                    });
                });
              } else {
                return res.status(401).json({ "error": "Ancien mot de passe incorrect" });
              }
            });
          } else {
            return res.status(500).json({ "error": "Utilisateur introuvable" });
          }
        })
        .catch(
          function (err) {
            return res.status(500).json({ "error": "Utilisateur introuvable" });
          }
        );
    },
    
    test : function(req, res, next){
        res.send("test marche")
    }
}