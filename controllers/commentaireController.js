
var Commentaire = require("../models/commentaire");

var auth = require("../midlewars/auth");

module.exports = {
    savecomment : function(req, res, next){
        const userId = req.auth.userId;
        var publicationId = req.body.publicationId;
        var  comments = req.body.comments;

        const dateActuelle = new Date();

        const annee = dateActuelle.getFullYear();
        const mois = dateActuelle.getMonth() + 1;
        const jour = dateActuelle.getDate();

        const heures = dateActuelle.getHours();
        const minutes = dateActuelle.getMinutes();
        const secondes = dateActuelle.getSeconds();

        const dateFormatee = `${annee}-${mois < 10 ? '0' : ''}${mois}-${jour < 10 ? '0' : ''}${jour}`;

        const heureFormatee = `${heures < 10 ? '0' : ''}${heures}:${minutes < 10 ? '0' : ''}${minutes}:${secondes < 10 ? '0' : ''}${secondes}`;

        var commentaire = new Commentaire({
            userId : userId,
            publicationId : publicationId,
            comments : comments,
            date : dateFormatee,
            heure : heureFormatee
        })
        commentaire
        .save()
        .then(function(commentaire){
            res.status(201).json({ "id" : commentaire._id });
        })
        .catch(function (error) {
            res.status(400).json({ error: error.message });
        })
    },

    listecomment: function(req, res, next){
        var publicationId = req.params.publicationId;
        console.log(publicationId);
        if (!publicationId) {
          return res.status(400).json({ "error": "ID de publication non fourni" });
        } else {
          Commentaire
            .find({ publicationId: publicationId })
            .populate('userId', 'email username')
            .then(commentaires => {
              if (commentaires && commentaires.length > 0) {
                return res.status(200).json(commentaires);
              } else {
                return res.status(404).json({ "error": "Aucun commentaire trouvé pour cette publication" });
              }
            })
            .catch(error => {
              console.error(error);
              return res.status(500).json({ error: "Erreur serveur" });
            });
        }
      }
}