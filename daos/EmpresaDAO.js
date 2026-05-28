const dbService = require('../services/DatabaseService');

const Empresa = require("../models/Empresa");

class EmpresaDAO {

    async findAll(nome) {

        let query =
            "SELECT * FROM empresas";

        

        if (nome) {

            query +=
                " WHERE nome LIKE '%" +
                nome +
                "%'";

        }

        const result =
            await dbService.query(query);

        return result.rows;

    }

    async findById(id) {

        const query =
            "SELECT * FROM empresas WHERE id = $1";

        const result =
            await dbService.query(
                query,
                [id]
            );

        return result.rows[0];

    }

    async create(nome) {

        try {

            const query = `

                INSERT INTO empresas
                (nome)

                VALUES ($1)

                RETURNING id

            `;

            const result =
                await dbService.query(
                    query,
                    [nome]
                );

            return new Empresa(
                result.rows[0].id,
                nome
            );

        } catch (error) {

            throw new Error(
                "Erro ao criar empresa: " +
                error.message
            );

        }

    }

    async update(id, nome) {

        try {

            const query = `

                UPDATE empresas

                SET nome = $1

                WHERE id = $2

            `;

            await dbService.query(
                query,
                [nome, id]
            );

            return {
                id,
                nome
            };

        } catch (error) {

            throw new Error(
                "Erro ao atualizar empresa: " +
                error.message
            );

        }

    }

    async delete(id) {

        try {

            const query =
                "DELETE FROM empresas WHERE id = $1";

            await dbService.query(
                query,
                [id]
            );

            return { id };

        } catch (error) {

            throw new Error(
                "Erro ao deletar empresa: " +
                error.message
            );

        }

    }

}

module.exports =
    new EmpresaDAO();