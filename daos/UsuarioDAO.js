const dbService = require('../services/DatabaseService');
const Usuario = require("../models/Usuario");
const UsuarioDTO = require("../dtos/UsuarioDTO");

class UsuarioDAO {

  async get(id) {
    const sql = 'SELECT * FROM usuarios WHERE id = $1';
    const result = await dbService.query(sql, [id]);
    const row = result.rows[0];
    if (!row) return null;
    return new UsuarioDTO(row.id, row.nome, row.email, row.data_nascimento, row.fk_perfil);
  }

  async getWithPasswd(id) {
    const sql = 'SELECT * FROM usuarios WHERE id = $1';
    const result = await dbService.query(sql, [id]);
    const row = result.rows[0];
    if (!row) return null;
    let usuario = new Usuario(row.nome, row.email, row.senha, row.data_nascimento, row.fk_perfil);
    usuario.id = row.id;
    return usuario;
  }

  async getByEmail(email) {
    const sql = 'SELECT u.id, u.nome, u.email, u.senha, p.nome as perfil FROM usuarios u JOIN perfis p ON u.fk_perfil = p.id WHERE u.email = $1';
    const result = await dbService.query(sql, [email]);
    return result.rows[0]; // Retorna a primeira linha ou undefined
  }

  async all() {
    const sql = 'SELECT * FROM usuarios';
    const result = await dbService.query(sql);
    if (!result || !result.rows) return [];
    return result.rows.map(row => new UsuarioDTO(row.id, row.nome, row.email, row.data_nascimento, row.fk_perfil));
  }

  async updatePassword(id, password) {
    const sql = 'UPDATE usuarios SET senha = $1 WHERE id = $2';
    const params = [password, id];
    const result = await dbService.query(sql, params);
    return { changes: result.rowCount };
  }

  async total() {
    const sql = 'SELECT count(*) as count FROM usuarios';
    const result = await dbService.query(sql);
    return result.rows[0]; // Retorna o objeto { count: 'X' } igual ao sqlite
  }

  async create(usuario) {
    console.log(usuario);
    // Adicionado RETURNING id para pegar o ID gerado automaticamente
    const sql = 'INSERT INTO usuarios (nome, email, senha, fk_perfil, data_nascimento) VALUES ($1, $2, $3, $4, $5) RETURNING id';
    const params = [usuario.nome, usuario.email, usuario.senha, usuario.fkPerfil, usuario.dataNascimento];
    const result = await dbService.query(sql, params);
    return { id: result.rows[0].id, ...usuario };
  }

  async update(id, usuario) {
    const sql = 'UPDATE usuarios SET nome = $1, data_nascimento = $2, fk_perfil = $3 WHERE id = $4';
    const params = [usuario.nome, usuario.dataNascimento, usuario.fkPerfil, id];
    const result = await dbService.query(sql, params);
    return { changes: result.rowCount };
  }

  async delete(id) {
    const sql = 'DELETE FROM usuarios WHERE id = $1';
    const result = await dbService.query(sql, [id]);
    return { changes: result.rowCount };
  }
}

module.exports = new UsuarioDAO();