// Utilitários da aplicação
class Utils {
    // Formatação de data
    static formatarData(data, formato = CONFIG.DATE_FORMAT) {
        if (!data) return '--';
        
        const date = new Date(data);
        if (isNaN(date.getTime())) return '--';
        
        const pad = (num) => num.toString().padStart(2, '0');
        
        const formatos = {
            'DD/MM/YYYY HH:mm:ss': `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
            'DD/MM/YYYY': `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`,
            'HH:mm:ss': `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`,
            'HH:mm': `${pad(date.getHours())}:${pad(date.getMinutes())}`,
            'relative': this.formatarDataRelativa(date)
        };
        
        return formatos[formato] || formatos['DD/MM/YYYY HH:mm:ss'];
    }

    // Formatação de data relativa
    static formatarDataRelativa(data) {
        const agora = new Date();
        const diff = agora - data;
        const minutos = Math.floor(diff / 60000);
        const horas = Math.floor(diff / 3600000);
        const dias = Math.floor(diff / 86400000);

        if (minutos < 1) return 'Agora mesmo';
        if (minutos < 60) return `${minutos} min atrás`;
        if (horas < 24) return `${horas}h atrás`;
        if (dias < 7) return `${dias} dias atrás`;
        
        return this.formatarData(data, 'DD/MM/YYYY');
    }

    // Formatação de números
    static formatarNumero(numero, casasDecimais = 2) {
        if (numero === null || numero === undefined) return '--';
        return parseFloat(numero).toFixed(casasDecimais);
    }

    // Formatação de porcentagem
    static formatarPorcentagem(valor, total = 100) {
        if (valor === null || valor === undefined) return '--%';
        return `${this.formatarNumero((valor / total) * 100)}%`;
    }

    // Validação de umidade
    static validarUmidade(umidade) {
        const valor = parseFloat(umidade);
        return !isNaN(valor) && valor >= VALIDATION.UMIDADE.MIN && valor <= VALIDATION.UMIDADE.MAX;
    }

    // Validação de intervalo
    static validarIntervalo(intervalo) {
        const valor = parseInt(intervalo);
        return !isNaN(valor) && valor >= VALIDATION.INTERVALO_LEITURA.MIN && valor <= VALIDATION.INTERVALO_LEITURA.MAX;
    }

    // Obter cor baseada na umidade
    static getCorUmidade(umidade) {
        if (umidade <= CONFIG.UMIDADE_LIMITES.critica) return CONFIG.CHART_COLORS.umidadeMax;
        if (umidade <= CONFIG.UMIDADE_LIMITES.baixa) return CONFIG.CHART_COLORS.umidadeMax;
        if (umidade >= CONFIG.UMIDADE_LIMITES.alta) return CONFIG.CHART_COLORS.umidadeMin;
        return CONFIG.CHART_COLORS.umidade;
    }

    // Obter status da umidade
    static getStatusUmidade(umidade) {
        if (umidade <= CONFIG.UMIDADE_LIMITES.critica) return 'Crítica';
        if (umidade <= CONFIG.UMIDADE_LIMITES.baixa) return 'Baixa';
        if (umidade >= CONFIG.UMIDADE_LIMITES.alta) return 'Alta';
        return 'Adequada';
    }

    // Sistema de notificações
    static mostrarNotificacao(mensagem, tipo = 'info', duracao = NOTIFICATION_CONFIG.AUTO_HIDE) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${tipo}`;
        
        toast.innerHTML = `
            <div class="toast-header">
                <span class="toast-title">${this.getTituloNotificacao(tipo)}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="toast-message">${mensagem}</div>
        `;

        container.appendChild(toast);

        // Animar entrada
        setTimeout(() => toast.classList.add('show'), 100);

        // Auto-remover
        if (duracao > 0) {
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => toast.remove(), 300);
            }, duracao);
        }
    }

    // Obter título da notificação
    static getTituloNotificacao(tipo) {
        const titulos = {
            success: 'Sucesso',
            error: 'Erro',
            warning: 'Aviso',
            info: 'Informação'
        };
        return titulos[tipo] || 'Notificação';
    }

    // Mostrar loading
    static mostrarLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('show');
        }
    }

    // Ocultar loading
    static ocultarLoading() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('show');
        }
    }

    // Debounce para evitar muitas chamadas
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Throttle para limitar frequência
    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Local Storage
    static salvarLocalStorage(chave, dados) {
        try {
            localStorage.setItem(chave, JSON.stringify(dados));
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
        }
    }

    static carregarLocalStorage(chave, padrao = null) {
        try {
            const dados = localStorage.getItem(chave);
            return dados ? JSON.parse(dados) : padrao;
        } catch (error) {
            console.error('Erro ao carregar do localStorage:', error);
            return padrao;
        }
    }

    // Exportar dados
    static exportarDados(dados, nomeArquivo, tipo = 'json') {
        let conteudo, mimeType, extensao;

        switch (tipo) {
            case 'csv':
                conteudo = this.converterParaCSV(dados);
                mimeType = 'text/csv';
                extensao = 'csv';
                break;
            case 'json':
            default:
                conteudo = JSON.stringify(dados, null, 2);
                mimeType = 'application/json';
                extensao = 'json';
                break;
        }

        const blob = new Blob([conteudo], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${nomeArquivo}.${extensao}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Converter dados para CSV
    static converterParaCSV(dados) {
        if (!Array.isArray(dados) || dados.length === 0) return '';

        const headers = Object.keys(dados[0]);
        const csvContent = [
            headers.join(','),
            ...dados.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
        ].join('\n');

        return csvContent;
    }

    // Copiar para clipboard
    static async copiarParaClipboard(texto) {
        try {
            await navigator.clipboard.writeText(texto);
            this.mostrarNotificacao('Texto copiado para a área de transferência!', 'success');
        } catch (error) {
            console.error('Erro ao copiar para clipboard:', error);
            this.mostrarNotificacao('Erro ao copiar texto', 'error');
        }
    }

    // Verificar se é mobile
    static isMobile() {
        return window.innerWidth <= 768;
    }

    // Verificar se está online
    static isOnline() {
        return navigator.onLine;
    }

    // Tratar erros da API
    static tratarErroAPI(erro) {
        console.error('Erro da API:', erro);
        
        let mensagem = ERROR_MESSAGES.UNKNOWN;
        
        if (erro.message.includes('Network Error') || erro.message.includes('Failed to fetch')) {
            mensagem = ERROR_MESSAGES.NETWORK_ERROR;
        } else if (erro.message.includes('401')) {
            mensagem = ERROR_MESSAGES.UNAUTHORIZED;
        } else if (erro.message.includes('404')) {
            mensagem = ERROR_MESSAGES.NOT_FOUND;
        } else if (erro.message.includes('timeout')) {
            mensagem = ERROR_MESSAGES.TIMEOUT;
        } else if (erro.message.includes('422') || erro.message.includes('400')) {
            mensagem = ERROR_MESSAGES.VALIDATION_ERROR;
        } else if (erro.message.includes('500')) {
            mensagem = ERROR_MESSAGES.API_ERROR;
        }
        
        this.mostrarNotificacao(mensagem, 'error');
        return mensagem;
    }

    // Gerar ID único
    static gerarId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Formatar bytes
    static formatarBytes(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Exportar utilitários
window.Utils = Utils; 