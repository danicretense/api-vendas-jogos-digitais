const ListaDesejo = require('../models/ListaDesejo');
const dbService = require('../services/DatabaseService');

class ListaDesejoDAO {
    async add(usuarioId, jogoId) {
        // Adicionado RETURNING id para pegar o valor gerado automaticamente
        const query = 'INSERT INTO lista_desejos (fk_usuario, fk_jogo) VALUES ($1, $2) RETURNING id';
        const params = [usuarioId, jogoId];
        const result = await dbService.query(query, params);
        
        // Substituição do lastID pelo id retornado no array rows
        const lista = new ListaDesejo(result.rows[0].id, usuarioId, jogoId);
        return lista;
    }

    async getByUser(fkUsuario) {
        const query = `
            SELECT jogos.*
            FROM lista_desejos
            JOIN jogos ON lista_desejos.fk_jogo = jogos.id
            WHERE lista_desejos.fk_usuario = $1
        `;
        const result = await dbService.query(query, [fkUsuario]);
        // Retorna a propriedade rows, com um fallback para array vazio caso algo falhe
        return result.rows || [];
    }

    async findByGameAndUser(usuarioId, jogoId) {
        const query = 'SELECT * FROM lista_desejos WHERE fk_usuario = $1 AND fk_jogo = $2';
        const result = await dbService.query(query, [usuarioId, jogoId]);
        const row = result.rows[0];
        
        return row ? new ListaDesejo(row.id, row.fk_usuario, row.fk_jogo) : null;
    }

    async exists(usuarioId, jogoId) {
        const query = 'SELECT 1 FROM lista_desejos WHERE fk_usuario = $1 AND fk_jogo = $2 LIMIT 1';
        const result = await dbService.query(query, [usuarioId, jogoId]);
        const exists = result.rows[0];
        
        if (!exists) return false;
        return true;
    }

    async countByGame(jogoId) {
        const query = 'SELECT COUNT(*) as total FROM lista_desejos WHERE fk_jogo = $1';
        const result = await dbService.query(query, [jogoId]);
        
        // Retorna o objeto contendo { total: 'valor' } da primeira linha
        return result.rows[0];
    }

    async remove(id) {
        const query = 'DELETE FROM lista_desejos WHERE id = $1';
        const result = await dbService.query(query, [id]);
        
        // Atualizado para rowCount nativo do pg
        return { changes: result.rowCount };
    }
}

module.exports = new ListaDesejoDAO();