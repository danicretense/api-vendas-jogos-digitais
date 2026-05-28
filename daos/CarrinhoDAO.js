const dbService = require('../services/DatabaseService');
const Carrinho = require("../models/Carrinho");

class CarrinhoDAO {
  async findByUser(fkUsuario) {
    const sql = 'SELECT * FROM carrinhos WHERE fk_usuario = $1';
    const result = await dbService.query(sql, [fkUsuario]);
    return result.rows.map(row => new Carrinho(row.id, row.fk_usuario, row.status, row.fk_venda));
  }

  async findAtivoByUser(fkUsuario) {
    // Aspas simples ('A') utilizadas, pois o PostgreSQL exige aspas simples para strings
    const sql = "SELECT * FROM carrinhos WHERE fk_usuario = $1 AND status = 'A'";
    const result = await dbService.query(sql, [fkUsuario]);
    const row = result.rows[0];
    return row ? new Carrinho(row.id, row.fk_usuario, row.status, row.fk_venda) : null;
  }

  async findAtivoByUserAndGame(fkUsuario, fkJjogo) {
    // Especificado 'c.*' para evitar conflito de IDs caso itens_carrinho retorne colunas com o mesmo nome
    const sql = `SELECT c.* FROM carrinhos c 
    JOIN itens_carrinho ic ON c.id = ic.fk_carrinho
    WHERE c.fk_usuario = $1 AND ic.fk_jogo = $2 AND c.status = 'A'`;
    const result = await dbService.query(sql, [fkUsuario, fkJjogo]);
    return result.rows[0] || null;
  }

  async findById(id) {
    const sql = 'SELECT * FROM carrinhos WHERE id = $1';
    const result = await dbService.query(sql, [id]);
    const row = result.rows[0];
    return row ? new Carrinho(row.id, row.fk_usuario, row.status, row.fk_venda) : null;
  }

  async findAll() {
    const sql = 'SELECT * FROM carrinhos';
    const result = await dbService.query(sql);
    return result.rows.map(row => new Carrinho(row.id, row.fk_usuario, row.status, row.fk_venda));
  }

  async create(fkUsuario) {
    // Adicionada a cláusula RETURNING * para capturar o ID gerado pelo banco e os valores default
    const sql = 'INSERT INTO carrinhos (fk_usuario) VALUES ($1) RETURNING *';
    const params = [fkUsuario];
    const result = await dbService.query(sql, params);
    const row = result.rows[0];
    return new Carrinho(row.id, row.fk_usuario, row.status, row.fk_venda);
  }

  async finalize(id, fkVenda) {
    const sql = `UPDATE carrinhos SET status = 'F', fk_venda = $1 WHERE id = $2`;
    const result = await dbService.query(sql, [fkVenda, id]);
    // O PostgreSQL retorna a quantidade de linhas afetadas na propriedade rowCount
    return { changes: result.rowCount };
  }

  async update(id, fkUsuario) {
    const sql = `UPDATE carrinhos SET fk_usuario = $1 WHERE id = $2`;
    const result = await dbService.query(sql, [fkUsuario, id]);
    return { changes: result.rowCount };
  }

  async delete(id) {
    const sql = 'DELETE FROM carrinhos WHERE id = $1';
    const result = await dbService.query(sql, [id]);
    return { changes: result.rowCount };
  }

  async deleteByUserId(fkUsuario) {
    const sql = 'DELETE FROM carrinhos WHERE fk_usuario = $1';
    const result = await dbService.query(sql, [fkUsuario]);
    return { changes: result.rowCount };
  }
}

module.exports = new CarrinhoDAO();