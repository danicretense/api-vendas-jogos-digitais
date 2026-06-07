const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {

  console.log("HEADERS RECEBIDOS:");
  console.log(req.headers);

  const authHeader = req.headers.authorization;

  console.log("AUTH HEADER:", authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Acesso negado. Nenhum token fornecido.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    req.user = decoded;

    next();

  } catch (error) {

    console.log("ERRO JWT:", error.message);

    return res.status(401).json({
      message: 'Token inválido.'
    });
  }
};

module.exports = authMiddleware;


//

