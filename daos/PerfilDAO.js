const dbService = require('../services/DatabaseService');

class PerfilDAO {
    async get(id) {
        const sql = 'SELECT * FROM perfis WHERE id = $1';
        const result = await dbService.query(sql, [id]);
        return result.rows[0];
    }

    async getByName(nome) {
        const sql = 'SELECT * FROM perfis WHERE nome = $1';
        const result = await dbService.query(sql, [nome]);
        return result.rows[0];
    }

    async all() {
        const sql = 'SELECT * FROM perfis';
        const result = await dbService.query(sql);
        return result.rows;
    }

    async create(perfil) {
        // Adicionado RETURNING id para obter o ID recém-criado
        const sql = 'INSERT INTO perfis (nome) VALUES ($1) RETURNING id';
        const params = [perfil.nome];
        const result = await dbService.query(sql, params);
        return { id: result.rows[0].id, ...perfil };
    }

    async update(id, perfil) {
        const sql = 'UPDATE perfis SET nome = $1 WHERE id = $2';
        const params = [perfil.nome, id];
        const result = await dbService.query(sql, params);
        return { changes: result.rowCount };
    }

    async delete(id) {
        const sql = 'DELETE FROM perfis WHERE id = $1';
        const result = await dbService.query(sql, [id]);
        return { changes: result.rowCount };
    }
}

module.exports = new PerfilDAO();