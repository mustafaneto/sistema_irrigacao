const { executeQuery } = require('../config/database');

class ConfiguracaoController {
    // Obter todas as configurações
    async getConfiguracoes(req, res) {
        try {
            const sql = `
                SELECT nome, valor, descricao, updated_at
                FROM configuracoes
                ORDER BY nome
            `;
            const configuracoes = await executeQuery(sql);

            // Converter para objeto mais fácil de usar
            const configObj = {};
            configuracoes.forEach(config => {
                configObj[config.nome] = {
                    valor: config.valor,
                    descricao: config.descricao,
                    atualizado: config.updated_at
                };
            });

            res.json({
                success: true,
                data: configObj
            });
        } catch (error) {
            console.error('Erro ao buscar configurações:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Obter configuração específica
    async getConfiguracao(req, res) {
        try {
            const { nome } = req.params;

            const sql = `
                SELECT nome, valor, descricao, updated_at
                FROM configuracoes
                WHERE nome = ?
            `;
            const [configuracao] = await executeQuery(sql, [nome]);

            if (!configuracao) {
                return res.status(404).json({
                    success: false,
                    message: 'Configuração não encontrada'
                });
            }

            res.json({
                success: true,
                data: configuracao
            });
        } catch (error) {
            console.error('Erro ao buscar configuração:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Atualizar configuração
    async atualizarConfiguracao(req, res) {
        try {
            const { nome } = req.params;
            const { valor } = req.body;

            if (!valor) {
                return res.status(400).json({
                    success: false,
                    message: 'Valor é obrigatório'
                });
            }

            // Validar configurações específicas
            const validacoes = this.validarConfiguracao(nome, valor);
            if (!validacoes.valido) {
                return res.status(400).json({
                    success: false,
                    message: validacoes.mensagem
                });
            }

            const sql = `
                UPDATE configuracoes 
                SET valor = ?, updated_at = CURRENT_TIMESTAMP
                WHERE nome = ?
            `;
            const result = await executeQuery(sql, [valor, nome]);

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Configuração não encontrada'
                });
            }

            res.json({
                success: true,
                message: 'Configuração atualizada com sucesso',
                data: { nome, valor }
            });
        } catch (error) {
            console.error('Erro ao atualizar configuração:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Validar configuração
    validarConfiguracao(nome, valor) {
        switch (nome) {
            case 'UMIDADE_MINIMA':
                const umidadeMin = parseFloat(valor);
                if (isNaN(umidadeMin) || umidadeMin < 0 || umidadeMin > 100) {
                    return {
                        valido: false,
                        mensagem: 'Umidade mínima deve estar entre 0 e 100'
                    };
                }
                break;

            case 'UMIDADE_MAXIMA':
                const umidadeMax = parseFloat(valor);
                if (isNaN(umidadeMax) || umidadeMax < 0 || umidadeMax > 100) {
                    return {
                        valido: false,
                        mensagem: 'Umidade máxima deve estar entre 0 e 100'
                    };
                }
                break;

            case 'INTERVALO_LEITURA':
                const intervalo = parseInt(valor);
                if (isNaN(intervalo) || intervalo < 1000 || intervalo > 60000) {
                    return {
                        valido: false,
                        mensagem: 'Intervalo de leitura deve estar entre 1000 e 60000 ms'
                    };
                }
                break;

            case 'ALERTA_UMIDADE_BAIXA':
                const alertaBaixa = parseFloat(valor);
                if (isNaN(alertaBaixa) || alertaBaixa < 0 || alertaBaixa > 100) {
                    return {
                        valido: false,
                        mensagem: 'Alerta de umidade baixa deve estar entre 0 e 100'
                    };
                }
                break;

            case 'ALERTA_UMIDADE_ALTA':
                const alertaAlta = parseFloat(valor);
                if (isNaN(alertaAlta) || alertaAlta < 0 || alertaAlta > 100) {
                    return {
                        valido: false,
                        mensagem: 'Alerta de umidade alta deve estar entre 0 e 100'
                    };
                }
                break;
        }

        return { valido: true };
    }

    // Obter configurações para o ESP8266
    async getConfiguracoesESP(req, res) {
        try {
            const sql = `
                SELECT nome, valor
                FROM configuracoes
                WHERE nome IN ('UMIDADE_MINIMA', 'UMIDADE_MAXIMA', 'INTERVALO_LEITURA')
                ORDER BY nome
            `;
            const configuracoes = await executeQuery(sql);

            const configESP = {};
            configuracoes.forEach(config => {
                configESP[config.nome] = config.valor;
            });

            res.json({
                success: true,
                data: configESP
            });
        } catch (error) {
            console.error('Erro ao buscar configurações ESP:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }
    }

    // Resetar configurações para valores padrão
    async resetarConfiguracoes(req, res) {
        try {
            const configuracoesPadrao = [
                { nome: 'UMIDADE_MINIMA', valor: '30' },
                { nome: 'UMIDADE_MAXIMA', valor: '60' },
                { nome: 'INTERVALO_LEITURA', valor: '5000' },
                { nome: 'ALERTA_UMIDADE_BAIXA', valor: '25' },
                { nome: 'ALERTA_UMIDADE_ALTA', valor: '70' }
            ];

            for (const config of configuracoesPadrao) {
                const sql = `
                    UPDATE configuracoes 
                    SET valor = ?, updated_at = CURRENT_TIMESTAMP
                    WHERE nome = ?
                `;
                await executeQuery(sql, [config.valor, config.nome]);
            }

            res.json({
                success: true,
                message: 'Configurações resetadas para valores padrão'
            });
        } catch (error) {
            console.error('Erro ao resetar configurações:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Erro interno do servidor' 
            });
        }
    }
}

module.exports = new ConfiguracaoController(); 