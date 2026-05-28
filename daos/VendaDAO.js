const dbService = require('../services/DatabaseService');
const Venda = require("../models/Venda");

class VendaDAO {
  async findById(id) {
    const sql = 'SELECT * FROM vendas WHERE id = $1';
    const result = await dbService.query(sql, [id]);
    return result.rows[0];
  }

  async findByUser(usuarioId) {
    const sql = 'SELECT * FROM vendas WHERE fk_usuario = $1';
    const result = await dbService.query(sql, [usuarioId]);
    
    // Observação: No seu código original, o '.map' estava sendo executado, mas o resultado não era retornado. 
    // Ajustei para retornar o array mapeado corretamente.
    return result.rows.map(row => new Venda(row.id, row.valor_total, row.quantidade, row.data, row.fk_usuario));
  }

  async findAll() {
    const sql = 'SELECT * FROM vendas';
    const result = await dbService.query(sql);
    return result.rows;
  }

  async create(venda) {
    // Adicionado RETURNING id para o PostgreSQL devolver o ID da nova venda
    const sql = 'INSERT INTO vendas (fk_usuario, data, valor_total, quantidade) VALUES ($1, $2, $3, $4) RETURNING id';
    const params = [venda.fkUsuario, venda.data, venda.valorTotal, venda.quantidade];
    const result = await dbService.query(sql, params);
    
    // Capturando o ID retornado
    venda.id = result.rows[0].id;
    return venda;
  }

  async update(id, venda) {
    const sql = 'UPDATE vendas SET fk_usuario = $1, data = $2, valor_total = $3, quantidade = $4 WHERE id = $5';
    const params = [venda.usuarioId, venda.data, venda.valorTotal, venda.quantidade, id];
    const result = await dbService.query(sql, params);
    return { changes: result.rowCount };
  }

  async delete(id) {
    const sql = 'DELETE FROM vendas WHERE id = $1';
    const result = await dbService.query(sql, [id]);
    return { changes: result.rowCount };
  }
}

module.exports = new VendaDAO();