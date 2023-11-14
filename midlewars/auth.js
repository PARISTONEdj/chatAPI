// const jwt = require('jsonwebtoken');
 
// module.exports = (req, res, next) => {
//    try {
//        const token = req.headers.authorization.split(' ')[1];
//        const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
//        const userId = decodedToken.userId;
//        req.auth = {
//            userId: userId
//        };
// 	next();
//    } catch(error) {
//         res.status(401).json({ error: 'Non autorisé' });

//    }
// };

const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // Vérifiez d'abord si req.headers.authorization est défini et non nul
        if (req.headers.authorization) {
            const token = req.headers.authorization.split(' ')[1];
            const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
            const userId = decodedToken.userId;
            req.auth = {
                userId: userId
            };
            next();
        } else {
            // Gestion de cas où l'en-tête d'autorisation est manquant
            res.status(401).json({ error: 'Non autorisé' });
        }
    } catch (error) {
        console.error('Erreur d\'authentification:', error);
        res.status(401).json({ error: 'Non autorisé' });
    }
};