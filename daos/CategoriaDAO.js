const dbService = require('../services/DatabaseService');
const Categoria = require("../models/Categoria");

class CategoriaDAO {
    async all(categoria) {
        let query = "SELECT * FROM categorias";

        const result = await dbService.query(query);
        
        
        if (!result || !result.rows) return [];
        
        return result.rows.map(row => new Categoria(row.id, row.nome));
    }

    async findById(id) {
      
        const query = "SELECT * FROM categorias WHERE id = $1";
        
        const result = await dbService.query(query, [id]);
        const row = result.rows[0]; // Pega o primeiro registro do array de resultados
        
        if (!row) return null;
        return new Categoria(row.id, row.nome);
    }
}

module.exports = new CategoriaDAO();