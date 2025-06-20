// Gerenciador de Configurações
class Configuracoes {
    constructor() {
        this.configuracoes = {};
        this.init();
    }

    // Inicializar módulo
    init() {
        this.setupEventListeners();
        this.loadConfiguracoes();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Botão salvar configurações
        const salvarBtn = document.getElementById('salvar-config');
        if (salvarBtn) {
            salvarBtn.addEventListener('click', () => this.salvarConfiguracoes());
        }

        // Botão resetar configurações
        const resetBtn = document.getElementById('reset-config');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetarConfiguracoes());
        }

        // Validação em tempo real
        this.setupValidation();
    }

    // Configurar validação
    setupValidation() {
        const inputs = document.querySelectorAll('.config-item input');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateInput(input));
            input.addEventListener('input', () => this.clearValidation(input));
        });
    }

    // Validar input
    validateInput(input) {
        const value = input.value;
        const fieldName = input.id;
        let isValid = true;
        let message = '';

        switch (fieldName) {
            case 'umidade-minima':
                if (!Utils.validarUmidade(value)) {
                    isValid = false;
                    message = 'Umidade deve estar entre 0 e 100%';
                }
                break;
            case 'umidade-maxima':
                if (!Utils.validarUmidade(value)) {
                    isValid = false;
                    message = 'Umidade deve estar entre 0 e 100%';
                }
                break;
            case 'alerta-umidade-baixa':
                if (!Utils.validarUmidade(value)) {
                    isValid = false;
                    message = 'Umidade deve estar entre 0 e 100%';
                }
                break;
            case 'alerta-umidade-alta':
                if (!Utils.validarUmidade(value)) {
                    isValid = false;
                    message = 'Umidade deve estar entre 0 e 100%';
                }
                break;
            case 'intervalo-leitura':
                if (!Utils.validarIntervalo(value)) {
                    isValid = false;
                    message = 'Intervalo deve estar entre 1000 e 60000ms';
                }
                break;
        }

        this.showValidation(input, isValid, message);
        return isValid;
    }

    // Mostrar validação
    showValidation(input, isValid, message) {
        const configItem = input.closest('.config-item');
        const existingError = configItem.querySelector('.validation-error');
        
        if (existingError) {
            existingError.remove();
        }

        if (!isValid) {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'validation-error';
            errorDiv.textContent = message;
            errorDiv.style.color = 'var(--danger-color)';
            errorDiv.style.fontSize = 'var(--font-size-sm)';
            errorDiv.style.marginTop = 'var(--spacing-1)';
            
            configItem.appendChild(errorDiv);
            input.style.borderColor = 'var(--danger-color)';
        } else {
            input.style.borderColor = 'var(--success-color)';
        }
    }

    // Limpar validação
    clearValidation(input) {
        input.style.borderColor = 'var(--gray-300)';
        const configItem = input.closest('.config-item');
        const errorDiv = configItem.querySelector('.validation-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    // Carregar configurações
    async loadConfiguracoes() {
        try {
            Utils.mostrarLoading();
            
            const response = await api.getConfiguracoes();
            
            if (response.success) {
                this.configuracoes = response.data;
                this.renderConfiguracoes();
            }
            
        } catch (error) {
            console.error('Erro ao carregar configurações:', error);
            Utils.tratarErroAPI(error);
        } finally {
            Utils.ocultarLoading();
        }
    }

    // Renderizar configurações
    renderConfiguracoes() {
        // Mapear configurações para campos
        const fieldMappings = {
            'UMIDADE_MINIMA': 'umidade-minima',
            'UMIDADE_MAXIMA': 'umidade-maxima',
            'ALERTA_UMIDADE_BAIXA': 'alerta-umidade-baixa',
            'ALERTA_UMIDADE_ALTA': 'alerta-umidade-alta',
            'INTERVALO_LEITURA': 'intervalo-leitura'
        };

        Object.entries(fieldMappings).forEach(([configKey, fieldId]) => {
            const field = document.getElementById(fieldId);
            if (field && this.configuracoes[configKey]) {
                field.value = this.configuracoes[configKey].valor;
            }
        });
    }

    // Salvar configurações
    async salvarConfiguracoes() {
        try {
            // Validar todos os campos
            const inputs = document.querySelectorAll('.config-item input');
            let allValid = true;
            
            inputs.forEach(input => {
                if (!this.validateInput(input)) {
                    allValid = false;
                }
            });

            if (!allValid) {
                Utils.mostrarNotificacao('Por favor, corrija os erros de validação', 'warning');
                return;
            }

            Utils.mostrarLoading();

            // Coletar valores dos campos
            const updates = {
                'UMIDADE_MINIMA': document.getElementById('umidade-minima').value,
                'UMIDADE_MAXIMA': document.getElementById('umidade-maxima').value,
                'ALERTA_UMIDADE_BAIXA': document.getElementById('alerta-umidade-baixa').value,
                'ALERTA_UMIDADE_ALTA': document.getElementById('alerta-umidade-alta').value,
                'INTERVALO_LEITURA': document.getElementById('intervalo-leitura').value
            };

            // Validar lógica de negócio
            if (parseFloat(updates.UMIDADE_MINIMA) >= parseFloat(updates.UMIDADE_MAXIMA)) {
                Utils.mostrarNotificacao('Umidade mínima deve ser menor que a máxima', 'warning');
                return;
            }

            if (parseFloat(updates.ALERTA_UMIDADE_BAIXA) >= parseFloat(updates.ALERTA_UMIDADE_ALTA)) {
                Utils.mostrarNotificacao('Alerta de umidade baixa deve ser menor que o alto', 'warning');
                return;
            }

            // Atualizar configurações
            const promises = Object.entries(updates).map(([nome, valor]) => 
                api.atualizarConfiguracao(nome, valor)
            );

            await Promise.all(promises);

            Utils.mostrarNotificacao(SUCCESS_MESSAGES.CONFIG_SAVED, 'success');
            
            // Recarregar configurações
            await this.loadConfiguracoes();
            
        } catch (error) {
            console.error('Erro ao salvar configurações:', error);
            Utils.tratarErroAPI(error);
        } finally {
            Utils.ocultarLoading();
        }
    }

    // Resetar configurações
    async resetarConfiguracoes() {
        try {
            const confirmed = confirm('Tem certeza que deseja resetar todas as configurações para os valores padrão?');
            if (!confirmed) return;

            Utils.mostrarLoading();

            await api.resetarConfiguracoes();
            
            Utils.mostrarNotificacao('Configurações resetadas com sucesso!', 'success');
            
            // Recarregar configurações
            await this.loadConfiguracoes();
            
        } catch (error) {
            console.error('Erro ao resetar configurações:', error);
            Utils.tratarErroAPI(error);
        } finally {
            Utils.ocultarLoading();
        }
    }

    // Obter configurações para ESP8266
    async getConfiguracoesESP() {
        try {
            const response = await api.getConfiguracoesESP();
            
            if (response.success) {
                return response.data;
            }
            
            return null;
        } catch (error) {
            console.error('Erro ao obter configurações ESP:', error);
            return null;
        }
    }

    // Validar configurações
    validarConfiguracoes() {
        const configs = {
            umidadeMinima: parseFloat(document.getElementById('umidade-minima').value),
            umidadeMaxima: parseFloat(document.getElementById('umidade-maxima').value),
            alertaBaixa: parseFloat(document.getElementById('alerta-umidade-baixa').value),
            alertaAlta: parseFloat(document.getElementById('alerta-umidade-alta').value),
            intervalo: parseInt(document.getElementById('intervalo-leitura').value)
        };

        const erros = [];

        // Validações básicas
        if (isNaN(configs.umidadeMinima) || configs.umidadeMinima < 0 || configs.umidadeMinima > 100) {
            erros.push('Umidade mínima inválida');
        }

        if (isNaN(configs.umidadeMaxima) || configs.umidadeMaxima < 0 || configs.umidadeMaxima > 100) {
            erros.push('Umidade máxima inválida');
        }

        if (isNaN(configs.alertaBaixa) || configs.alertaBaixa < 0 || configs.alertaBaixa > 100) {
            erros.push('Alerta de umidade baixa inválido');
        }

        if (isNaN(configs.alertaAlta) || configs.alertaAlta < 0 || configs.alertaAlta > 100) {
            erros.push('Alerta de umidade alta inválido');
        }

        if (isNaN(configs.intervalo) || configs.intervalo < 1000 || configs.intervalo > 60000) {
            erros.push('Intervalo de leitura inválido');
        }

        // Validações de lógica
        if (configs.umidadeMinima >= configs.umidadeMaxima) {
            erros.push('Umidade mínima deve ser menor que a máxima');
        }

        if (configs.alertaBaixa >= configs.alertaAlta) {
            erros.push('Alerta de umidade baixa deve ser menor que o alto');
        }

        return {
            isValid: erros.length === 0,
            errors: erros
        };
    }

    // Exportar configurações
    exportarConfiguracoes() {
        try {
            const configs = {
                timestamp: new Date().toISOString(),
                configuracoes: this.configuracoes
            };

            Utils.exportarDados(configs, 'configuracoes_sistema', 'json');
            Utils.mostrarNotificacao('Configurações exportadas com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao exportar configurações:', error);
            Utils.mostrarNotificacao('Erro ao exportar configurações', 'error');
        }
    }

    // Importar configurações
    async importarConfiguracoes(file) {
        try {
            const text = await file.text();
            const configs = JSON.parse(text);

            if (!configs.configuracoes) {
                throw new Error('Arquivo de configuração inválido');
            }

            // Aplicar configurações importadas
            this.configuracoes = configs.configuracoes;
            this.renderConfiguracoes();

            Utils.mostrarNotificacao('Configurações importadas com sucesso!', 'success');
            
        } catch (error) {
            console.error('Erro ao importar configurações:', error);
            Utils.mostrarNotificacao('Erro ao importar configurações', 'error');
        }
    }

    // Atualizar configurações
    refresh() {
        this.loadConfiguracoes();
    }

    // Destruir módulo
    destroy() {
        // Limpar event listeners se necessário
    }
}

// Instância global das configurações
window.configuracoes = new Configuracoes(); 