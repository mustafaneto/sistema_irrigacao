const { executeQuery } = require('../config/database');

class AlertaController {
    async getAlertas(req, res) {
        try {
            const { limit = 50, offset = 0, status = 'nao_lido' } = req.query;

            let whereClause = '';
            if (status === 'nao_lido') {
                whereClause = 'WHERE lido = FALSE';
            } else if (status === 'lido') {
                whereClause = 'WHERE lido = TRUE';
            }

            const sql = `
                SELECT id, tipo, mensagem, nivel, lido, timestamp
                FROM alertas
                ${whereClause}
                ORDER BY timestamp DESC
                LIMIT ? OFFSET ?
            `;
            
            const alertas = await executeQuery(sql, [parseInt(limit), parseInt(offset)]);
            
            res.json({ success: true, data: alertas });
        } catch (error) {
            console.error('Erro ao buscar alertas:', error);
            res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }

    async marcarAlertaLido(req, res) {
        try {
            const { id } = req.params;
            const sql = 'UPDATE alertas SET lido = TRUE WHERE id = ?';
            const result = await executeQuery(sql, [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ success: false, message: 'Alerta não encontrado' });
            }

            res.json({ success: true, message: 'Alerta marcado como lido' });
        } catch (error) {
            console.error('Erro ao marcar alerta como lido:', error);
            res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }

    async marcarTodosAlertasLidos(req, res) {
        try {
            const sql = 'UPDATE alertas SET lido = TRUE WHERE lido = FALSE';
            await executeQuery(sql);
            res.json({ success: true, message: 'Todos os alertas foram marcados como lidos' });
        } catch (error) {
            console.error('Erro ao marcar todos os alertas como lidos:', error);
            res.status(500).json({ success: false, message: 'Erro interno do servidor' });
        }
    }
}

module.exports = new AlertaController(); 