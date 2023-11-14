
var Publication = require("../models/publication");
var auth = require("../midlewars/auth");


module.exports = {
    creer : function(req, res, next){
        var titre = req.body.titre;
        var contenu = req.body.contenu;
        var description = req.body.description;
        var pubimage = req.body.pubimage; 

        console.log(req.body);
        console.log("tire "+titre+" desc :"+description);
        if(!titre || !contenu){
            return res.status(400).json({"error" : "renseigner tous les champs"});
        }
        else{
            var newPub = new Publication({
                titre : titre,
                contenu : contenu,
                description : description,
                datepub : new Date(),
                pubimage : pubimage,
                userId: req.auth.userId,
            });
            newPub
            .save()
            .then(function(newpub){
                res.status(201).json({ "id" : newpub._id });
            })
            .catch(function (error) {
                res.status(400).json({ error: error.message });
            });
        }
    },

   creerPub : function(req, res, next){

    if (req.body.jsonData) {
      try {
        const thingObject = JSON.parse(req.body.jsonData);
        console.log("objet : "+thingObject);
        delete thingObject._id;
        delete thingObject._userId;
        const thing = new Publication({
            ...thingObject,
            userId: req.auth.userId,
            pubimage: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
        });
  
        thing.save()
        .then(() => { res.status(201).json({message: 'Objet enregistré !'})})
        .catch(error => { res.status(400).json( { error })})
          } catch (error) {
            res.status(400).json({ error: "Données JSON non valides" });
            console.log("Données JSON non valides")
          }
    } else {
      res.status(400).json({ error: "Les données JSON sont manquantes" });
      console.log("Données JSON non valides")

    }
 
   },
   
    supprimer : function(req, res, next){
        var id = req.params.id;
        console.log("l id est : "+id);
      if(id ==null){
        return res.status(400).json({"error" : "publication nom trouver"})
      }
      else{
    Publication.findOne({_id : id})
            .then(function(pubfound){
              if(pubfound){
                Publication.deleteOne({_id : id})
                    .then(()=>res.status(200).json({"message" : "Publication supprimer"}))
                    .catch(function(err){
                      return res.status(500).json({"error" : "Echec suppression"})
                    })
              }
              else{
                return res.status(500).json({"error" : "Publication introuvable"});
              }
            })
            .catch(
              function(err){
                return res.status(500).json({ "error": "Publication introuvable" });
              }
            )
      }
    },

    modifier : function(req, res, next){
        var id = req.params.id;
      console.log("le parametre est absolument : "+id);

      console.log(req.body);
      
      Publication.findOne({_id : id})
          .then(function(pubfound){
            if(pubfound){
              Publication.updateOne({_id : id}, {...req.body, _id : id})
                  .then(()=>res.status(200).json({"message" : "Publication modifier"}))
                  .catch(function(err){
                    return res.status(500).json({"error" : "Mise a jour echouer"});
                  })
            }
            else{
              return res.status(500).json({"error" : "Publication introuvable"});
            }
          })
          .catch(
            function(err){
              return res.status(500).json({ "error": "Publication introuvable" });
            }
          )

    },

    one : function(req, res, next){
        var id = req.params.id;
        console.log("le parametre est : "+id);
        Publication
        .findOne({_id : id})
        .populate('userId', 'email username') // Utilisez .populate() pour remplacer idUser par les champs spécifiés
        .exec()
        .then(publications => res.status(200).json(publications))
        .catch(error => res.status(400).json({ error }));
    },

    all : function(req, res, next){
        Publication
        .find()
        .then(publications => res.status(200).json(publications))
        .catch(error => res.status(400).json({ error }));
    },

    Mespub : function(req, res, next){
      const userId = req.auth.userId;
      Publication
      .find({ userId: userId }) // Filtrer les publications par ID de l'utilisateur
      .then(publications => res.status(200).json(publications))
      .catch(error => res.status(400).json({ error }));
    }
}