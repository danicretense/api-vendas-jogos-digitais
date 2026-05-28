const dbService = require('../services/DatabaseService');
const Jogo = require("../models/Jogo");
const JogoMaisVendidoDTO = require('../dtos/JogoMaisVendidoDTO');

class RelatorioDAO {
    async countGameMostSell(top) {
        const query = `
            SELECT
                j.nome AS jogo,
                e.nome AS empresa,
                COUNT(ic.fk_jogo) as total_vendas
            FROM jogos j
            LEFT JOIN itens_carrinho ic ON j.id = ic.fk_jogo
            LEFT JOIN carrinhos c ON ic.fk_carrinho = c.id
            LEFT JOIN empresas e ON j.fk_empresa = e.id
            WHERE c.status = 'F'
            GROUP BY j.id, j.nome, j.preco, e.nome
            ORDER BY total_vendas DESC
            LIMIT $1`;
        
        const result = await dbService.query(query, [top]);
        if (!result || !result.rows) return [];
        return result.rows.map(row => new JogoMaisVendidoDTO(row.jogo, row.empresa, row.total_vendas));
    }

    async countGameSellByEnterprise(top, empresaId) {
        const query = `
            SELECT
                j.nome AS jogo,
                e.nome AS empresa,
                COUNT(ic.fk_jogo) as total_vendas
            FROM jogos j
            LEFT JOIN itens_carrinho ic ON j.id = ic.fk_jogo
            LEFT JOIN carrinhos c ON ic.fk_carrinho = c.id
            LEFT JOIN empresas e ON j.fk_empresa = e.id
            WHERE c.status = 'F' AND e.id = $1
            GROUP BY j.id, j.nome, j.preco, e.nome
            ORDER BY total_vendas DESC
            LIMIT $2`;
            
        const result = await dbService.query(query, [empresaId, top]);
        if (!result || !result.rows) return [];
        return result.rows.map(row => new JogoMaisVendidoDTO(row.jogo, row.empresa, row.total_vendas));
    }
}

module.exports = new RelatorioDAO();