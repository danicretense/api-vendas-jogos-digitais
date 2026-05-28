const dbService = require('../services/DatabaseService');

const Avaliacao = require('../models/Avaliacao');

class AvaliacaoDAO {

    async findById(id) {

        const sql =
            'SELECT * FROM avaliacoes WHERE id = $1';

        const result =
            await dbService.query(
                sql,
                [id]
            );

        const row =
            result.rows[0];

        return row

            ? new Avaliacao(
                row.id,
                row.fk_jogo,
                row.fk_usuario,
                row.nota,
                row.comentario
            )

            : null;

    }

    async findByUserAndGame(
        fkUsuario,
        fkJogo
    ) {

        const sql = `

            SELECT *

            FROM avaliacoes

            WHERE fk_usuario = $1

            AND fk_jogo = $2

        `;

        const result =
            await dbService.query(
                sql,
                [fkUsuario, fkJogo]
            );

        const row =
            result.rows[0];

        return row

            ? new Avaliacao(
                row.id,
                row.fk_jogo,
                row.fk_usuario,
                row.nota,
                row.comentario
            )

            : null;

    }

    async findByGame(fkJogo) {

        const sql =
            'SELECT * FROM avaliacoes WHERE fk_jogo = $1';

        const result =
            await dbService.query(
                sql,
                [fkJogo]
            );

        return result.rows.map(

            row => new Avaliacao(
                row.id,
                row.fk_jogo,
                row.fk_usuario,
                row.nota,
                row.comentario
            )

        );

    }

    async findByUser(fkUsuario) {

        const sql =
            'SELECT * FROM avaliacoes WHERE fk_usuario = $1';

        const result =
            await dbService.query(
                sql,
                [fkUsuario]
            );

        return result.rows.map(

            row => new Avaliacao(
                row.id,
                row.fk_jogo,
                row.fk_usuario,
                row.nota,
                row.comentario
            )

        );

    }

    async create(avaliacao) {

        const sql = `

            INSERT INTO avaliacoes
            (
                fk_usuario,
                fk_jogo,
                nota,
                comentario,
                data
            )

            VALUES
            (
                $1,
                $2,
                $3,
                $4,
                $5
            )

            RETURNING id

        `;

        const params = [

            avaliacao.fkUsuario,

            avaliacao.fkJogo,

            avaliacao.nota,

            avaliacao.comentario,

            new Date().toISOString()

        ];

        const result =
            await dbService.query(
                sql,
                params
            );

        avaliacao.id =
            result.rows[0].id;

        return avaliacao;

    }

    async update(
        id,
        nota,
        comentario
    ) {

        const sql = `

            UPDATE avaliacoes

            SET
                nota = $1,
                comentario = $2,
                data = $3

            WHERE id = $4

        `;

        const result =
            await dbService.query(
                sql,
                [
                    nota,
                    comentario,
                    new Date().toISOString(),
                    id
                ]
            );

        return {

            changes:
                result.rowCount

        };

    }

    async delete(id) {

        const sql =
            'DELETE FROM avaliacoes WHERE id = $1';

        const result =
            await dbService.query(
                sql,
                [id]
            );

        return {

            changes:
                result.rowCount

        };

    }

}

module.exports =
    new AvaliacaoDAO();