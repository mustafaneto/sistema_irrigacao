-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS sistema_irrigacao;
USE sistema_irrigacao;

-- Tabela de usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo_usuario ENUM('admin', 'usuario') DEFAULT 'usuario',
    ativo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de configurações do sistema
CREATE TABLE configuracoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    valor TEXT NOT NULL,
    descricao TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de leituras de umidade
CREATE TABLE leituras_umidade (
    id INT AUTO_INCREMENT PRIMARY KEY,
    valor_umidade DECIMAL(5,2) NOT NULL,
    valor_analogico INT NOT NULL,
    status_rele ENUM('ligado', 'desligado') NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dispositivo_id VARCHAR(50) DEFAULT 'ESP8266'
);

-- Tabela de histórico de ativações do relé
CREATE TABLE historico_rele (
    id INT AUTO_INCREMENT PRIMARY KEY,
    acao ENUM('ligado', 'desligado') NOT NULL,
    motivo VARCHAR(255),
    umidade_anterior DECIMAL(5,2),
    umidade_atual DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    dispositivo_id VARCHAR(50) DEFAULT 'ESP8266'
);

-- Tabela de alertas
CREATE TABLE alertas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo ENUM('baixa_umidade', 'alta_umidade', 'erro_sensor', 'erro_rele') NOT NULL,
    mensagem TEXT NOT NULL,
    nivel ENUM('baixo', 'medio', 'alto', 'critico') DEFAULT 'medio',
    lido BOOLEAN DEFAULT FALSE,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de estatísticas diárias
CREATE TABLE estatisticas_diarias (
    id INT AUTO_INCREMENT PRIMARY KEY,
    data DATE NOT NULL,
    umidade_media DECIMAL(5,2),
    umidade_minima DECIMAL(5,2),
    umidade_maxima DECIMAL(5,2),
    tempo_irrigacao_minutos INT DEFAULT 0,
    numero_ativacoes INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_data (data)
);

-- Inserir configurações padrão
INSERT INTO configuracoes (nome, valor, descricao) VALUES
('UMIDADE_MINIMA', '60', 'Umidade mínima para ativar irrigação (%)'),
('UMIDADE_MAXIMA', '60', 'Umidade máxima para desativar irrigação (%)'),
('INTERVALO_LEITURA', '5000', 'Intervalo entre leituras em milissegundos'),
('MQTT_TOPIC_UMIDADE', 'irrigacao/umidade', 'Tópico MQTT para dados de umidade'),
('MQTT_TOPIC_RELE', 'irrigacao/rele', 'Tópico MQTT para status do relé'),
('ALERTA_UMIDADE_BAIXA', '40', 'Limite para alerta de umidade baixa (%)'),
('ALERTA_UMIDADE_ALTA', '80', 'Limite para alerta de umidade alta (%)');

-- Inserir usuário administrador padrão (senha: admin123)
INSERT INTO usuarios (nome, email, senha, tipo_usuario) VALUES
('Administrador', 'admin@sistema.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2O', 'admin');

-- Índices para otimização
CREATE INDEX idx_leituras_timestamp ON leituras_umidade(timestamp);
CREATE INDEX idx_historico_timestamp ON historico_rele(timestamp);
CREATE INDEX idx_alertas_timestamp ON alertas(timestamp);
CREATE INDEX idx_alertas_lido ON alertas(lido);
CREATE INDEX idx_estatisticas_data ON estatisticas_diarias(data); 