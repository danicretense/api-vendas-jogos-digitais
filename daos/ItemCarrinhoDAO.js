const dbService = require('../services/DatabaseService');
const ItemCarrinho = require("../models/ItemCarrinho");

class ItemCarrinhoDAO {
  async create(item) {
    // Adicionado RETURNING * para pegar o ID gerado pelo PostgreSQL
    const sql = 'INSERT INTO itens_carrinho (fk_jogo, fk_carrinho) VALUES ($1, $2) RETURNING *';
    const params = [item.fkJogo, item.fkCarrinho];
    const result = await dbService.query(sql, params);
    const row = result.rows[0]; // Extrai a linha recém-inserida
    return new ItemCarrinho(row.id, row.fk_jogo, row.fk_carrinho);
  }

  async updateChaveAtivacao(id, chaveAtivacao) {
    const sql = `UPDATE itens_carrinho SET chave_ativacao = $1 WHERE id = $2`;
    const result = await dbService.query(sql, [chaveAtivacao, id]);
    // Uso de result.rowCount para pegar as linhas afetadas
    return { changes: result.rowCount }; 
  }

  async findById(id) {
    const sql = 'SELECT * FROM itens_carrinho WHERE id = $1';
    const result = await dbService.query(sql, [id]);
    const row = result.rows[0];
    if (!row) return null; // Prevenção de erro caso não encontre o registro
    return new ItemCarrinho(row.id, row.fk_jogo, row.fk_carrinho);
  }

  async findByCarrinho(fkCarrinho) {
    const sql = 'SELECT * FROM itens_carrinho ic WHERE fk_carrinho = $1';
    const result = await dbService.query(sql, [fkCarrinho]);
    return result.rows.map(row => new ItemCarrinho(row.id, row.fk_jogo, row.fk_carrinho, row.chave_ativacao));
  }

  async findByCarrinhoAndGame(fkCarrinho, fkJogo) {
    const sql = 'SELECT * FROM itens_carrinho ic WHERE fk_carrinho = $1 AND fk_jogo = $2';
    const result = await dbService.query(sql, [fkCarrinho, fkJogo]);
    const row = result.rows[0];
    if (!row) return null;
    return new ItemCarrinho(row.id, row.fk_jogo, row.fk_carrinho);
  }

  async delete(id) {
    const sql = 'DELETE FROM itens_carrinho WHERE id = $1';
    const result = await dbService.query(sql, [id]);
    return { changes: result.rowCount };
  }
}

module.exports = new ItemCarrinhoDAO();