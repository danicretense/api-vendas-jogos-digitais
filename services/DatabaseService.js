const pool =
   require('../config/Database')
   .pool;

class DatabaseService {

   async query(
      sql,
      params = []
   ){

      try{

         const result =
            await pool.query(
               sql,
               params
            );

         return result;

      }catch(erro){

         console.error(

            'Erro SQL:',

            sql,

            params,

            erro

         );

         throw erro;

      }

   }

}

module.exports =
   new DatabaseService();