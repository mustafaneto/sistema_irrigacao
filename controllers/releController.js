const { executeQuery } = require('../config/database');

class ReleController {
    async getHistoricoRele(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;
            
            const sql = `
                SELECT id, acao, motivo, umidade_atual, timestamp
                FROM historico_rele
                ORDER BY timestamp DESC
                LIMIT ${limit} OFFSET ${offset}
            `;

            const historico = await executeQuery(sql);
            const totalSql = 'SELECT COUNT(*) as total FROM historico_rele';
            const [{ total }] = await executeQuery(totalSql);

            res.json({
                success: true,
                data: historico,
                pagination: {
                    limit: limit,
                    offset: offset,
                    total
                }
            });
        } catch (error) {
            console.error('Erro ao buscar histórico do relé:', error);
            res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }
}

module.exports = new ReleController(); 