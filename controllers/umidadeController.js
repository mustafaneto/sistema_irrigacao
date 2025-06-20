const { executeQuery } = require('../config/database');
const moment = require('moment');

class UmidadeController {
    // Obter última leitura de umidade
    async getUltimaLeitura(req, res) {
        try {
            const sql = `
                SELECT valor_umidade, valor_analogico, status_rele, timestamp
                FROM leituras_umidade 
                ORDER BY timestamp DESC 
                LIMIT 1
            `;
            const [leitura] = await executeQuery(sql);

            if (!leitura) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Nenhuma leitura encontrada' 
                });
            }

            res.json({
                success: true,
                data: {
                    umidade: leitura.valor_umidade,
                    analogico: leitura.valor_analogico,
                    statusRele: leitura.status_rele,
                    timestamp: leitura.timestamp
                }
            });
        } catch (error) {
            console.error('Erro ao buscar última leitura:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Obter histórico de leituras
    async getHistorico(req, res) {
        try {
            const limit = parseInt(req.query.limit) || 100;
            const offset = parseInt(req.query.offset) || 0;
            const { data_inicio, data_fim } = req.query;
            
            let sql = `
                SELECT valor_umidade, valor_analogico, status_rele, timestamp
                FROM leituras_umidade
            `;
            const params = [];

            // Filtros de data
            if (data_inicio || data_fim) {
                sql += ' WHERE 1=1';
                if (data_inicio) {
                    sql += ' AND DATE(timestamp) >= ?';
                    params.push(data_inicio);
                }
                if (data_fim) {
                    sql += ' AND DATE(timestamp) <= ?';
                    params.push(data_fim);
                }
            }

            sql += ` ORDER BY timestamp DESC LIMIT ${limit} OFFSET ${offset}`;

            const leituras = await executeQuery(sql, params);

            res.json({
                success: true,
                data: leituras,
                pagination: {
                    limit: limit,
                    offset: offset,
                    total: leituras.length // Note: This might not be the total count in the DB
                }
            });
        } catch (error) {
            console.error('Erro ao buscar histórico:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Obter estatísticas
    async getEstatisticas(req, res) {
        try {
            const { periodo = 'hoje' } = req.query;
            
            let dataInicio, dataFim;
            
            switch (periodo) {
                case 'hoje':
                    dataInicio = moment().startOf('day').format('YYYY-MM-DD');
                    dataFim = moment().endOf('day').format('YYYY-MM-DD');
                    break;
                case 'semana':
                    dataInicio = moment().subtract(7, 'days').format('YYYY-MM-DD');
                    dataFim = moment().format('YYYY-MM-DD');
                    break;
                case 'mes':
                    dataInicio = moment().subtract(30, 'days').format('YYYY-MM-DD');
                    dataFim = moment().format('YYYY-MM-DD');
                    break;
                default:
                    dataInicio = moment().startOf('day').format('YYYY-MM-DD');
                    dataFim = moment().endOf('day').format('YYYY-MM-DD');
            }

            // Estatísticas de umidade
            const sqlUmidade = `
                SELECT 
                    AVG(valor_umidade) as media,
                    MIN(valor_umidade) as minima,
                    MAX(valor_umidade) as maxima,
                    COUNT(*) as total_leituras
                FROM leituras_umidade 
                WHERE DATE(timestamp) BETWEEN ? AND ?
            `;
            const [statsUmidade] = await executeQuery(sqlUmidade, [dataInicio, dataFim]);

            // Estatísticas do relé
            const sqlRele = `
                SELECT 
                    COUNT(*) as total_ativacoes,
                    SUM(CASE WHEN acao = 'ligado' THEN 1 ELSE 0 END) as vezes_ligado,
                    SUM(CASE WHEN acao = 'desligado' THEN 1 ELSE 0 END) as vezes_desligado
                FROM historico_rele 
                WHERE DATE(timestamp) BETWEEN ? AND ?
            `;
            const [statsRele] = await executeQuery(sqlRele, [dataInicio, dataFim]);

            // Últimas 24 horas por hora
            const sql24h = `
                SELECT 
                    HOUR(timestamp) as hora,
                    AVG(valor_umidade) as umidade_media,
                    COUNT(*) as leituras
                FROM leituras_umidade 
                WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 24 HOUR)
                GROUP BY HOUR(timestamp)
                ORDER BY hora
            `;
            const dados24h = await executeQuery(sql24h);

            res.json({
                success: true,
                data: {
                    periodo: {
                        inicio: dataInicio,
                        fim: dataFim
                    },
                    umidade: {
                        media: parseFloat(statsUmidade.media || 0).toFixed(2),
                        minima: parseFloat(statsUmidade.minima || 0).toFixed(2),
                        maxima: parseFloat(statsUmidade.maxima || 0).toFixed(2),
                        totalLeituras: statsUmidade.total_leituras || 0
                    },
                    rele: {
                        totalAtivacoes: statsRele.total_ativacoes || 0,
                        vezesLigado: statsRele.vezes_ligado || 0,
                        vezesDesligado: statsRele.vezes_desligado || 0
                    },
                    ultimas24h: dados24h
                }
            });
        } catch (error) {
            console.error('Erro ao buscar estatísticas:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Obter dados para gráfico
    async getDadosGrafico(req, res) {
        try {
            const { tipo = 'umidade', horas = 24 } = req.query;
            
            let sql;
            
            if (tipo === 'umidade') {
                sql = `
                    SELECT 
                        DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as periodo,
                        AVG(valor_umidade) as valor,
                        COUNT(*) as leituras
                    FROM leituras_umidade 
                    WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
                    GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00')
                    ORDER BY periodo
                `;
            } else if (tipo === 'rele') {
                sql = `
                    SELECT 
                        DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00') as periodo,
                        SUM(CASE WHEN acao = 'ligado' THEN 1 ELSE 0 END) as ligado,
                        SUM(CASE WHEN acao = 'desligado' THEN 1 ELSE 0 END) as desligado
                    FROM historico_rele 
                    WHERE timestamp >= DATE_SUB(NOW(), INTERVAL ? HOUR)
                    GROUP BY DATE_FORMAT(timestamp, '%Y-%m-%d %H:00:00')
                    ORDER BY periodo
                `;
            }

            const dados = await executeQuery(sql, [parseInt(horas)]);

            res.json({
                success: true,
                data: {
                    tipo,
                    periodo: `${horas} horas`,
                    dados
                }
            });
        } catch (error) {
            console.error('Erro ao buscar dados do gráfico:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Inserir leitura manual (para testes)
    async inserirLeitura(req, res) {
        try {
            const { umidade, analogico, statusRele } = req.body;

            if (!umidade || umidade < 0 || umidade > 100) {
                return res.status(400).json({
                    success: false,
                    message: 'Umidade deve estar entre 0 e 100'
                });
            }

            const sql = `
                INSERT INTO leituras_umidade (valor_umidade, valor_analogico, status_rele)
                VALUES (?, ?, ?)
            `;
            await executeQuery(sql, [umidade, analogico || 0, statusRele || 'desligado']);

            res.status(201).json({
                success: true,
                message: 'Leitura inserida com sucesso'
            });
        } catch (error) {
            console.error('Erro ao inserir leitura:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }
    }
}

module.exports = new UmidadeController(); 