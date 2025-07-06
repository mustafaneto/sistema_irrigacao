#include <ESP8266WiFi.h>
#include <PubSubClient.h>

const char* ssid = "";
const char* password = "";

const char* mqtt_server = "";
const int mqtt_port = ;
const char* mqtt_user = "";
const char* mqtt_password = "";

WiFiClient espClient;
PubSubClient client(espClient);

#define rele D4

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Conectando em ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi conectado");
  Serial.print("IP: ");
  Serial.println(WiFi.localIP());
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Tentando conexão MQTT...");
    if (client.connect("ESP8266Client", mqtt_user, mqtt_password)) {
      Serial.println("conectado");
    } else {
      Serial.print("falhou, rc=");
      Serial.print(client.state());
      Serial.println(" tentando novamente em 5 segundos");
      delay(5000);
    }
  }
}

void setup() {
  pinMode(rele, OUTPUT);
  digitalWrite(rele, LOW);

  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();

  int leitura = analogRead(A0);
  float umidade = (1 - (leitura / 1023.0)) * 100.0;

  Serial.print("Umidade: ");
  Serial.println(umidade);

  String payload = String(umidade);
  client.publish("irrigacao/umidade", payload.c_str());

  if (umidade <= 30) {
    digitalWrite(rele, LOW);
    client.publish("irrigacao/rele", "ligado");
  } else if (umidade > 30) {
    digitalWrite(rele, HIGH);
    client.publish("irrigacao/rele", "desligado");
  }

  delay(5000);
}
