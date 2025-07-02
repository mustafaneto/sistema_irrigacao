# Sistema de Irrigação Inteligente

Sistema completo de monitoramento e controle de irrigação usando ESP8266, Node.js e interface web.

## 📋 Sobre o Projeto

Sistema de irrigação inteligente que monitora a umidade do solo através de sensores conectados ao ESP8266 e permite controle remoto via interface web. O sistema utiliza MQTT para comunicação em tempo real e MySQL para armazenamento de dados.

## 🚀 Funcionalidades

- **Monitoramento em Tempo Real**: Visualização da umidade atual do solo
- **Controle do Relé**: Ativar/desativar irrigação manualmente
- **Histórico de Dados**: Consulta de leituras anteriores
- **Gráficos Interativos**: Visualização da variação da umidade
- **Status do Sistema**: Monitoramento da conexão MQTT
- **API REST**: Endpoints para integração com outros sistemas

## 🛠️ Tecnologias

### Backend
- **Node.js** com Express
- **MySQL** para banco de dados
- **MQTT** para comunicação com ESP8266

### Frontend
- **HTML5** e **CSS3**
- **JavaScript** vanilla
- **Chart.js** para gráficos
- **Font Awesome** para ícones

## 📁 Estrutura do Projeto

```
app/
├── server.js                 # Servidor principal
├── index.html               # Interface web
├── package.json             # Dependências
├── config/
│   └── database.js          # Configuração do banco
├── controllers/
│   ├── umidadeController.js # Controle de umidade
│   ├── releController.js    # Controle do relé
│   └── sistemaController.js # Status do sistema
├── services/
│   └── mqttService.js       # Serviço MQTT
├── database/
│   └── schema.sql           # Schema do banco
├── js/
│   ├── app.js              # Aplicação principal
│   ├── api.js              # Cliente da API
│   ├── config.js           # Configurações
│   ├── dashboard.js        # Dashboard
│   ├── historico.js        # Histórico
│   ├── charts.js           # Gráficos
│   └── utils.js            # Utilitários
└── styles/
    └── main.css            # Estilos
```

## 🔧 Instalação

1. **Clone o repositório**
```bash
git clone [url-do-repositorio]
cd app
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o banco de dados**
- Crie um banco MySQL
- Execute o script `database/schema.sql`
- Configure as credenciais em `config/database.js`

4. **Configure as variáveis de ambiente**
Crie um arquivo `.env` na raiz:
```env
PORT=3000
DB_HOST=localhost
DB_USER=seu_usuario
DB_PASS=sua_senha
DB_NAME=sistema_irrigacao
MQTT_BROKER=seu_broker_mqtt
MQTT_PORT=1883
```

5. **Inicie o servidor**
```bash
npm start
```

6. **Acesse a aplicação**
Abra `http://localhost:3000` no navegador

## 📡 API Endpoints

### Umidade
- `GET /api/umidade/ultima` - Última leitura
- `GET /api/umidade/historico` - Histórico de leituras
- `GET /api/umidade/estatisticas` - Estatísticas
- `GET /api/umidade/grafico` - Dados para gráfico
- `POST /api/umidade/inserir` - Inserir nova leitura

### Relé
- `GET /api/rele/historico` - Histórico do relé

### Sistema
- `GET /api/sistema/status` - Status geral
- `GET /api/sistema/mqtt-status` - Status MQTT

## 🔌 Integração com ESP8266

O ESP8266 deve:
1. Conectar ao broker MQTT
2. Publicar leituras de umidade no tópico `sensor/umidade`
3. Escutar comandos no tópico `rele/controle`

### Formato dos Dados

**Leitura de umidade:**
```json
{
  "umidade": 65.5,
  "timestamp": "2024-01-01T12:00:00Z"
}
```

**Comando do relé:**
```json
{
  "acao": "ligar" // ou "desligar"
}
```

## 🎯 Como Usar

1. **Dashboard**: Visualize dados em tempo real
2. **Histórico**: Consulte leituras anteriores
3. **Controles**: Ative/desative a irrigação
4. **Configurações**: Ajuste parâmetros do sistema

## 🚀 Desenvolvimento

```bash
# Modo desenvolvimento com auto-reload
npm run dev

# Executar testes
npm test
```

## 📊 Monitoramento

O sistema monitora:
- Umidade do solo em tempo real
- Status da conexão MQTT
- Histórico de ativações do relé
- Performance da API

## 🔒 Segurança

- Validação de dados
- Headers de segurança (Helmet)
- CORS configurado

## 👥 Autores

- **Mustafa Neto** - Desenvolvimento
- **Rafael Cabral** - Desenvolvimento

## 📄 Licença

MIT License

---

**Versão**: 1.0.0 