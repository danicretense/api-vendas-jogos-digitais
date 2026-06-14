
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { hashPassword } = require('../util/cripto');

require('dotenv').config();

class Database {

    constructor() {

        this.pool = new Pool({

            connectionString:
                process.env.DATABASE_URL,

            ssl: {
                rejectUnauthorized: false
            }

        });

        this.init();

    }

    async init() {

        try {

            console.log(
                'Conectado ao PostgreSQL.'
            );

            await this.createTables();

           // await this.seed();

           // await this.seedJogosFromCSV();

        } catch (erro) {

            console.log(
                'Erro ao iniciar banco:',
                erro
            );

        }

    }

    async createTables() {

        // PERFIS

        await this.pool.query(`

            CREATE TABLE IF NOT EXISTS perfis (

                id SERIAL PRIMARY KEY,

                nome VARCHAR(255)
                UNIQUE NOT NULL

            )

        `);

        // USUÁRIOS

        await this.pool.query(`

            CREATE TABLE IF NOT EXISTS usuarios (

                id SERIAL PRIMARY KEY,

                nome VARCHAR(255)
                NOT NULL,

                email VARCHAR(255)
                UNIQUE NOT NULL,

                senha VARCHAR(255)
                NOT NULL,

                data_nascimento TIMESTAMP,

                fk_perfil INTEGER
                NOT NULL,

                FOREIGN KEY (fk_perfil)
                REFERENCES perfis(id)

            )

        `);

        // CATEGORIAS

        await this.pool.query(`

            CREATE TABLE IF NOT EXISTS categorias (

                id SERIAL PRIMARY KEY,

                nome VARCHAR(255)
                UNIQUE NOT NULL

            )

        `);

        // EMPRESAS

        await this.pool.query(`

            CREATE TABLE IF NOT EXISTS empresas (

                id SERIAL PRIMARY KEY,

                nome VARCHAR(255)
                UNIQUE NOT NULL

            )

        `);

        // JOGOS

        await this.pool.query(`

            CREATE TABLE IF NOT EXISTS jogos (

                id SERIAL PRIMARY KEY,

                nome VARCHAR(255)
                NOT NULL,

                ano INTEGER
                NOT NULL,

                preco REAL
                NOT NULL,

                desconto REAL,

                descricao TEXT,

                fk_empresa INTEGER
                NOT NULL,

                fk_categoria INTEGER
                NOT NULL,

                FOREIGN KEY (fk_empresa)
                REFERENCES empresas(id),

                FOREIGN KEY (fk_categoria)
                REFERENCES categorias(id),

                UNIQUE(nome, fk_empresa)

            )

        `);

        // VENDAS

        await this.pool.query(`

            CREATE TABLE IF NOT EXISTS vendas (

                id SERIAL PRIMARY KEY,

                fk_usuario INTEGER
                NOT NULL,

                valor_total REAL
                NOT NULL,

                quantidade INTEGER
                NOT NULL,

                data TIMESTAMP
                DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (fk_usuario)
                REFERENCES usuarios(id)

            )

        `);

        // CARRINHOS

        await this.pool.query(`

            CREATE TABLE IF NOT EXISTS carrinhos (

                id SERIAL PRIMARY KEY,

                fk_usuario INTEGER
                NOT NULL,

                fk_venda INTEGER,

                status TEXT
                NOT NULL DEFAULT 'A',

                FOREIGN KEY (fk_usuario)
                REFERENCES usuarios(id),

                FOREIGN KEY (fk_venda)
                REFERENCES vendas(id)

            )

        `);

        // ITENS CARRINHO

        await this.pool.query(`

            CREATE TABLE IF NOT EXISTS itens_carrinho (

                id SERIAL PRIMARY KEY,

                fk_jogo INTEGER
                NOT NULL,

                fk_carrinho INTEGER
                NOT NULL,

                chave_ativacao TEXT,

                FOREIGN KEY (fk_jogo)
                REFERENCES jogos(id),

                FOREIGN KEY (fk_carrinho)
                REFERENCES carrinhos(id)

            )

        `);

        // AVALIAÇÕES

        await this.pool.query(`

            CREATE TABLE IF NOT EXISTS avaliacoes (

                id SERIAL PRIMARY KEY,

                fk_usuario INTEGER
                NOT NULL,

                fk_jogo INTEGER
                NOT NULL,

                nota INTEGER
                CHECK(nota >= 1 AND nota <= 5),

                comentario TEXT,

                data TIMESTAMP
                DEFAULT CURRENT_TIMESTAMP,

                FOREIGN KEY (fk_usuario)
                REFERENCES usuarios(id),

                FOREIGN KEY (fk_jogo)
                REFERENCES jogos(id),

                UNIQUE(fk_usuario, fk_jogo)

            )

        `);

        // LISTA DE DESEJOS

        await this.pool.query(`

            CREATE TABLE IF NOT EXISTS lista_desejos (

                id SERIAL PRIMARY KEY,

                fk_usuario INTEGER
                NOT NULL,

                fk_jogo INTEGER
                NOT NULL,

                FOREIGN KEY (fk_usuario)
                REFERENCES usuarios(id),

                FOREIGN KEY (fk_jogo)
                REFERENCES jogos(id),

                UNIQUE(fk_usuario, fk_jogo)

            )

        `);

        console.log(
            'Tabelas criadas.'
        );

    }

    async seed() {

        // PERFIS

        await this.pool.query(`

            INSERT INTO perfis (nome)

            VALUES ('Administrador')

            ON CONFLICT DO NOTHING

        `);

        await this.pool.query(`

            INSERT INTO perfis (nome)

            VALUES ('Cliente')

            ON CONFLICT DO NOTHING

        `);

        // SENHAS

        const passAdmin =
            await hashPassword(
                'admin123'
            );

        const passCliente =
            await hashPassword(
                'cliente123'
            );

        // USUÁRIOS

        await this.pool.query(`

            INSERT INTO usuarios
            (
                nome,
                email,
                senha,
                fk_perfil
            )

            VALUES
            (
                $1,
                $2,
                $3,
                (
                    SELECT id
                    FROM perfis
                    WHERE nome = 'Administrador'
                )
            )

            ON CONFLICT (email)
            DO NOTHING

        `, [

            'Admin',
            'admin@avjd.com',
            passAdmin

        ]);

        await this.pool.query(`

            INSERT INTO usuarios
            (
                nome,
                email,
                senha,
                fk_perfil
            )

            VALUES
            (
                $1,
                $2,
                $3,
                (
                    SELECT id
                    FROM perfis
                    WHERE nome = 'Cliente'
                )
            )

            ON CONFLICT (email)
            DO NOTHING

        `, [

            'Cliente',
            'cliente@avjd.com',
            passCliente

        ]);

        console.log(
            'Seed executado.'
        );

    }

    async seedJogosFromCSV() {

        const csvFilePath = path.join(
            __dirname,
            'jogos.csv'
        );

        const data = fs.readFileSync(
            csvFilePath,
            'utf8'
        );

        const lines =
            data.split('\n');

        for (const line of lines) {

            const [
                nome,
                ano,
                preco,
                descricao,
                empresa,
                categoria
            ] = line.split(',');

            if (!nome) continue;

            // EMPRESA

            await this.pool.query(`

                INSERT INTO empresas (nome)

                VALUES ($1)

                ON CONFLICT DO NOTHING

            `, [empresa]);

            // CATEGORIA

            await this.pool.query(`

                INSERT INTO categorias (nome)

                VALUES ($1)

                ON CONFLICT DO NOTHING

            `, [categoria]);

            // JOGO

            await this.pool.query(`

                INSERT INTO jogos
                (
                    nome,
                    ano,
                    preco,
                    descricao,
                    fk_empresa,
                    fk_categoria
                )

                VALUES
                (
                    $1,
                    $2,
                    $3,
                    $4,

                    (
                        SELECT id
                        FROM empresas
                        WHERE nome = $5
                    ),

                    (
                        SELECT id
                        FROM categorias
                        WHERE nome = $6
                    )
                )

                ON CONFLICT
                (nome, fk_empresa)

                DO NOTHING

            `, [

                nome,

                parseInt(ano),

                parseFloat(preco),

                descricao,

                empresa,

                categoria

            ]);

        }

        console.log(
            'Jogos inseridos.'
        );

    }

}

module.exports = {

   pool:
      new Database().pool

};
