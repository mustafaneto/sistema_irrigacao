// Gerenciador do Histórico
class Historico {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = CONFIG.PAGINACAO.itensPorPagina;
        this.totalItems = 0;
        this.filters = {
            data_inicio: '',
            data_fim: ''
        };
        this.init();
    }

    // Inicializar módulo
    init() {
        this.setupEventListeners();
        this.loadData();
    }

    // Configurar event listeners
    setupEventListeners() {
        // Filtros
        const aplicarFiltrosBtn = document.getElementById('aplicar-filtros');
        if (aplicarFiltrosBtn) {
            aplicarFiltrosBtn.addEventListener('click', () => this.aplicarFiltros());
        }

        // Campos de data
        const dataInicio = document.getElementById('data-inicio');
        const dataFim = document.getElementById('data-fim');
        
        if (dataInicio) {
            dataInicio.addEventListener('change', () => this.updateFilters());
        }
        
        if (dataFim) {
            dataFim.addEventListener('change', () => this.updateFilters());
        }

        // Carregar filtros salvos
        this.loadSavedFilters();
    }

    // Carregar dados
    async loadData() {
        try {
            Utils.mostrarLoading();
            
            const params = {
                limit: this.itemsPerPage,
                offset: (this.currentPage - 1) * this.itemsPerPage,
                ...this.filters
            };

            const response = await api.getHistoricoUmidade(params);
            
            if (response.success) {
                this.renderTable(response.data);
                this.renderPagination(response.pagination);
            }
            
        } catch (error) {
            console.error('Erro ao carregar histórico:', error);
            Utils.tratarErroAPI(error);
        } finally {
            Utils.ocultarLoading();
        }
    }

    // Renderizar tabela
    renderTable(data) {
        const tbody = document.getElementById('historico-tbody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (!data || data.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="4" class="text-center">
                        <p>Nenhum dado encontrado</p>
                    </td>
                </tr>
            `;
            return;
        }

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${Utils.formatarData(item.timestamp)}</td>
                <td>
                    <span class="umidade-valor" style="color: ${Utils.getCorUmidade(item.valor_umidade)}">
                        ${Utils.formatarNumero(item.valor_umidade)}%
                    </span>
                </td>
                <td>${item.valor_analogico}</td>
                <td>
                    <span class="status-badge ${item.status_rele}">
                        ${item.status_rele === 'ligado' ? 'Ligado' : 'Desligado'}
                    </span>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    // Renderizar paginação
    renderPagination(pagination) {
        const container = document.getElementById('historico-pagination');
        if (!container) return;

        const { total, limit, offset } = pagination;
        const totalPages = Math.ceil(total / limit);
        const currentPage = Math.floor(offset / limit) + 1;

        if (totalPages <= 1) {
            container.innerHTML = '';
            return;
        }

        let paginationHTML = '<div class="pagination-controls">';
        
        // Botão anterior
        if (currentPage > 1) {
            paginationHTML += `
                <button class="btn btn-secondary btn-sm" onclick="historico.goToPage(${currentPage - 1})">
                    <i class="fas fa-chevron-left"></i> Anterior
                </button>
            `;
        }

        // Páginas
        const startPage = Math.max(1, currentPage - 2);
        const endPage = Math.min(totalPages, currentPage + 2);

        for (let i = startPage; i <= endPage; i++) {
            if (i === currentPage) {
                paginationHTML += `<span class="page-number active">${i}</span>`;
            } else {
                paginationHTML += `
                    <button class="page-number" onclick="historico.goToPage(${i})">${i}</button>
                `;
            }
        }

        // Botão próximo
        if (currentPage < totalPages) {
            paginationHTML += `
                <button class="btn btn-secondary btn-sm" onclick="historico.goToPage(${currentPage + 1})">
                    Próximo <i class="fas fa-chevron-right"></i>
                </button>
            `;
        }

        paginationHTML += '</div>';

        // Informações da paginação
        paginationHTML += `
            <div class="pagination-info">
                Mostrando ${offset + 1} a ${Math.min(offset + limit, total)} de ${total} registros
            </div>
        `;

        container.innerHTML = paginationHTML;
    }

    // Ir para página específica
    goToPage(page) {
        this.currentPage = page;
        this.loadData();
    }

    // Aplicar filtros
    aplicarFiltros() {
        this.currentPage = 1; // Voltar para primeira página
        this.loadData();
        this.saveFilters();
    }

    // Atualizar filtros
    updateFilters() {
        const dataInicio = document.getElementById('data-inicio');
        const dataFim = document.getElementById('data-fim');
        
        this.filters.data_inicio = dataInicio ? dataInicio.value : '';
        this.filters.data_fim = dataFim ? dataFim.value : '';
    }

    // Carregar filtros salvos
    loadSavedFilters() {
        const savedFilters = Utils.carregarLocalStorage(STORAGE_KEYS.FILTERS, {});
        
        if (savedFilters.historico) {
            this.filters = { ...this.filters, ...savedFilters.historico };
            
            // Aplicar filtros aos campos
            const dataInicio = document.getElementById('data-inicio');
            const dataFim = document.getElementById('data-fim');
            
            if (dataInicio && this.filters.data_inicio) {
                dataInicio.value = this.filters.data_inicio;
            }
            
            if (dataFim && this.filters.data_fim) {
                dataFim.value = this.filters.data_fim;
            }
        }
    }

    // Salvar filtros
    saveFilters() {
        const savedFilters = Utils.carregarLocalStorage(STORAGE_KEYS.FILTERS, {});
        savedFilters.historico = this.filters;
        Utils.salvarLocalStorage(STORAGE_KEYS.FILTERS, savedFilters);
    }

    // Limpar filtros
    limparFiltros() {
        this.filters = {
            data_inicio: '',
            data_fim: ''
        };
        
        const dataInicio = document.getElementById('data-inicio');
        const dataFim = document.getElementById('data-fim');
        
        if (dataInicio) dataInicio.value = '';
        if (dataFim) dataFim.value = '';
        
        this.currentPage = 1;
        this.loadData();
        this.saveFilters();
    }

    // Exportar dados do histórico
    async exportarHistorico(formato = 'csv') {
        try {
            Utils.mostrarLoading();
            
            // Buscar todos os dados sem paginação
            const params = {
                limit: 10000, // Buscar muitos registros
                ...this.filters
            };

            const response = await api.getHistoricoUmidade(params);
            
            if (response.success && response.data) {
                const dados = response.data.map(item => ({
                    Data: Utils.formatarData(item.timestamp),
                    Umidade: `${Utils.formatarNumero(item.valor_umidade)}%`,
                    'Valor Analógico': item.valor_analogico,
                    'Status Relé': item.status_rele
                }));
                
                const nomeArquivo = `historico_umidade_${new Date().toISOString().split('T')[0]}`;
                Utils.exportarDados(dados, nomeArquivo, formato);
                Utils.mostrarNotificacao('Histórico exportado com sucesso!', 'success');
            }
            
        } catch (error) {
            console.error('Erro ao exportar histórico:', error);
            Utils.tratarErroAPI(error);
        } finally {
            Utils.ocultarLoading();
        }
    }

    // Buscar dados por texto
    async buscarPorTexto(texto) {
        try {
            // Implementar busca por texto se necessário
            console.log('Busca por texto:', texto);
            
        } catch (error) {
            console.error('Erro na busca:', error);
            Utils.tratarErroAPI(error);
        }
    }

    // Atualizar dados
    refresh() {
        this.loadData();
    }

    // Destruir módulo
    destroy() {
        // Limpar event listeners se necessário
    }
}

// Instância global do histórico
window.historico = new Historico(); 