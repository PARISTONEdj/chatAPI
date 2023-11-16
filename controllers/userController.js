
var User = require("../models/user");

var bcrypt = require("bcrypt");

const jwt = require('jsonwebtoken');

var auth = require("../midlewars/auth");

const Otp = require("../models/Otp");

const otpGenerator = require("otp-generator");

const { Vonage } = require('@vonage/server-sdk')

const vonage = new Vonage({
  apiKey: "553e6d39",
  apiSecret: "DN0SZIb2KRCpxYsL"
})

async function sendSMS() {
  await vonage.sms.send({to, from, text})
      .then(resp => { console.log('Message sent successfully'); console.log(resp); })
      .catch(err => { console.log('There was an error sending the messages.'); console.error(err); });
}

const accountSid = 'ACdef4b84d8610ed3d604856a0342032a0';
const authToken = '74cceddf7433a2aae6d9c7a8c2192642';
const verifySid = "VA017477655c961145b615144d116a333b";


const client = require('twilio')(accountSid, authToken);

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
    },

    registerPhone: function (req, res, next) {
      var email = req.body.email;
      var password = req.body.password;
      var username = req.body.username;
      var bio = req.body.bio;
      var telephone = req.body.telephone;
    
      if (!email || !username || !password) {
        return res.status(400).json({ error: "Veuillez renseigner email, username et password" });
      } else {
        User.findOne({ email: email })
          .then(function (userfound) {
            if (userfound) {
              return res.status(409).json({ error: "L'utilisateur existe déjà" });
            } else {
              bcrypt.hash(password, 10, function (err, bcryptpassword) {
                if (err) {
                  return res.status(500).json({ error: "Erreur lors du hachage du mot de passe" });
                }
    
                var newUser = new User({
                  email: email,
                  password: bcryptpassword,
                  username: username,
                  bio: bio,
                  telephone: telephone,
                  isAdmin: false
                });
    
                newUser
                  .save()
                  .then(function (newUser) {
                    const otp = otpGenerator.generate(4, {
                      digits: true, alphabets: false, upperCaseAlphabets: false, specialChars: false
                    });
    
                    const otps = new Otp({
                      number: telephone,
                      otp: otp,
                      userId: newUser._id
                    });
    
                    otps.save()
                      .then(() => {
                        console.log('OTP saved successfully');
                        const from = 'PARISTONE APIs';
                        const to = telephone;
                        const text = `Bonjour ${username}, voici le code d'activation de ton compte : ${otp}`;
    
                        // vonage.sms.send({ to, from, text })
                        //   .then(resp => {
                        //     console.log('Message sent successfully');
                        //     console.log(resp);
                        //     res.status(200).json({ message: 'Code OTP envoyé avec succès' });
                        //   })
                        //   .catch(err => {
                        //     console.log('Erreur lors de l\'envoi du SMS:', err);
                        //     res.status(500).json({ error: 'Erreur lors de l\'envoi du SMS' });
                        //   });
                        client.messages
                        .create({
                          body: `Bonjour ${username}, voici le code d'activation de ton compte : ${otp}`,
                          to: '+21650516175', // Text your number
                          from: '+21650516175', // From a valid Twilio number
                        })
                        .then((message) => console.log(message.sid));
                      })
                      .catch(error => {
                        console.log('Erreur lors de l\'enregistrement du code OTP:', error);
                        res.status(500).json({ error: 'Erreur lors de l\'enregistrement du code OTP' });
                      });
    
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

    verifyOTP : function(req, res, next) {
      const telephone = req.body.telephone;
      const userOTP = req.body.otp;
    
      // Recherchez l'OTP dans la base de données
      Otp.findOne({ number: telephone, otp: userOTP })
        .then((otpRecord) => {
          if (otpRecord) {
            // Vérification de l'OTP réussie
            User.findOne({ _id: otpRecord.userId })
              .then(function (userfound) {
                if (userfound) {
                  // Mettez à jour le statut "active" de l'utilisateur
                  User.updateOne({ _id: otpRecord.userId }, { active: true })
                    .then(() => {
                      // Générez le token JWT et renvoyez la réponse
                      const token = jwt.sign(
                        { userId: userfound._id },
                        'RANDOM_TOKEN_SECRET',
                        { expiresIn: '7d' }
                      );
                      res.status(200).json({
                        message: 'Vérification de l\'OTP réussie',
                        userId: userfound._id,
                        token: token
                      });
                    })
                    .catch(function (err) {
                      return res.status(500).json({ "error": "Mise à jour du statut active échouée" });
                    });
                } else {
                  return res.status(500).json({ "error": "Utilisateur introuvable" });
                }
              })
              .catch(function (err) {
                return res.status(500).json({ "error": "Utilisateur introuvable" });
              });
          } else {
            // L'OTP fourni ne correspond pas à celui enregistré dans la base de données
            res.status(400).json({ error: 'Code OTP invalide' });
          }
        })
        .catch((error) => {
          // Erreur lors de la recherche de l'OTP dans la base de données
          console.error('Erreur lors de la vérification de l\'OTP :', error);
          res.status(500).json({ error: 'Erreur lors de la vérification de l\'OTP' });
        });
    }
}