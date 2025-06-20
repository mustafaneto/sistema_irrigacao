// Configurações da aplicação
const CONFIG = {
    // API
    API_BASE_URL: 'http://localhost:3000/api',
    API_TIMEOUT: 10000,
    
    // Atualizações automáticas
    AUTO_REFRESH_INTERVAL: 5000, // 5 segundos
    CHART_UPDATE_INTERVAL: 10000, // 10 segundos
    
    // Configurações do gráfico
    CHART_COLORS: {
        umidade: '#2563eb',
        umidadeMin: '#10b981',
        umidadeMax: '#f59e0b',
        rele: '#ef4444'
    },
    
    // Limites de umidade
    UMIDADE_LIMITES: {
        baixa: 30,
        alta: 60,
        critica: 20
    },
    
    // Status do relé
    RELE_STATUS: {
        ligado: 'ligado',
        desligado: 'desligado'
    },
    
    // Tipos de alerta
    ALERTA_TIPOS: {
        baixa_umidade: 'Baixa Umidade',
        alta_umidade: 'Alta Umidade',
        erro_sensor: 'Erro Sensor',
        erro_rele: 'Erro Relé'
    },
    
    // Níveis de alerta
    ALERTA_NIVEIS: {
        baixo: 'Baixo',
        medio: 'Médio',
        alto: 'Alto',
        critico: 'Crítico'
    },
    
    // Paginação
    PAGINACAO: {
        itensPorPagina: 50,
        maxPaginas: 10
    },
    
    // Formatação de data
    DATE_FORMAT: 'DD/MM/YYYY HH:mm:ss',
    DATE_FORMAT_SHORT: 'DD/MM/YYYY',
    TIME_FORMAT: 'HH:mm:ss'
};

// Configurações de endpoints da API
const API_ENDPOINTS = {
    // Umidade
    UMIDADE: {
        ULTIMA: '/umidade/ultima',
        HISTORICO: '/umidade/historico',
        ESTATISTICAS: '/umidade/estatisticas',
        GRAFICO: '/umidade/grafico',
        INSERIR: '/umidade/inserir'
    },
    
    // Configurações
    CONFIGURACAO: {
        TODAS: '/configuracao',
        ESPECIFICA: '/configuracao/:nome',
        ATUALIZAR: '/configuracao/:nome',
        ESP: '/configuracao/esp',
        RESETAR: '/configuracao/resetar'
    },
    
    // Alertas
    ALERTAS: {
        TODOS: '/alertas',
        MARCAR_LIDO: '/alertas/:id/lido',
        MARCAR_TODOS_LIDOS: '/alertas/marcar-todos-lidos'
    },
    
    // Histórico do relé
    RELE: {
        HISTORICO: '/rele/historico'
    },
    
    // Status do sistema
    SISTEMA: {
        STATUS: '/sistema/status',
        MQTT_STATUS: '/sistema/mqtt-status'
    }
};

// Configurações de validação
const VALIDATION = {
    UMIDADE: {
        MIN: 0,
        MAX: 100
    },
    INTERVALO_LEITURA: {
        MIN: 1000,
        MAX: 60000
    }
};

// Mensagens de erro
const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Erro de conexão. Verifique sua internet.',
    API_ERROR: 'Erro no servidor. Tente novamente.',
    VALIDATION_ERROR: 'Dados inválidos. Verifique os campos.',
    UNAUTHORIZED: 'Acesso não autorizado.',
    NOT_FOUND: 'Recurso não encontrado.',
    TIMEOUT: 'Tempo limite excedido.',
    UNKNOWN: 'Erro desconhecido.'
};

// Mensagens de sucesso
const SUCCESS_MESSAGES = {
    CONFIG_SAVED: 'Configurações salvas com sucesso!',
    DATA_EXPORTED: 'Dados exportados com sucesso!',
    ALERT_MARKED: 'Alerta marcado como lido!',
    ALL_ALERTS_MARKED: 'Todos os alertas marcados como lidos!',
    MANUAL_ACTION: 'Ação executada com sucesso!'
};

// Configurações de notificações
const NOTIFICATION_CONFIG = {
    AUTO_HIDE: 5000,
    POSITION: 'top-right',
    TYPES: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        INFO: 'info'
    }
};

// Configurações de localStorage
const STORAGE_KEYS = {
    USER_PREFERENCES: 'irrigacao_user_prefs',
    CHART_SETTINGS: 'irrigacao_chart_settings',
    FILTERS: 'irrigacao_filters',
    THEME: 'irrigacao_theme'
};

// Exportar configurações
window.CONFIG = CONFIG;
window.API_ENDPOINTS = API_ENDPOINTS;
window.VALIDATION = VALIDATION;
window.ERROR_MESSAGES = ERROR_MESSAGES;
window.SUCCESS_MESSAGES = SUCCESS_MESSAGES;
window.NOTIFICATION_CONFIG = NOTIFICATION_CONFIG;
window.STORAGE_KEYS = STORAGE_KEYS; 