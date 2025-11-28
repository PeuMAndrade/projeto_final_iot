/*
  Código para ESP32 - Controle para Jogo de Ritmo via WebSocket

  Este código conecta o ESP32 a uma rede Wi-Fi e a um servidor WebSocket
  para enviar o estado de quatro botões, simulando uma guitarra de jogo.

  == REQUISITOS DE HARDWARE ==
  - Placa ESP32
  - 4x Push Buttons (botões)
  - Fios para conexão

  == CONFIGURAÇÃO DO CIRCUITO ==
  Conecte os botões da seguinte forma (um lado do botão ao pino e o outro ao GND):
  - Botão Verde:   Pino GPIO 12
  - Botão Vermelho: Pino GPIO 13
  - Botão Azul:     Pino GPIO 14
  - Botão Amarelo:  Pino GPIO 27
  O código usa os resistores pull-up internos do ESP32.

  == REQUISITOS DE SOFTWARE ==
  - Arduino IDE com suporte para ESP32
  - Biblioteca "ArduinoWebsockets" por Gil Mota (Instale via Library Manager)

  == INSTRUÇÕES ==
  1. Instale a biblioteca "ArduinoWebsockets" no seu Arduino IDE.
  2. Altere as variáveis `ssid` e `password` com os dados da sua rede Wi-Fi.
  3. Altere a variável `websocket_server_ip` para o endereço IP do computador
     onde o frontend (o jogo) está rodando. O ESP32 não entende "localhost".
  4. Faça o upload do código para o seu ESP32.
  5. Abra o Serial Monitor para ver o status da conexão.
*/

#include <WiFi.h>
#include <ArduinoWebsockets.h>

// --- CONFIGURAÇÕES DO USUÁRIO ---
const char *ssid = "Mand2g";
const char *password = "Luciene.456";
const char *websocket_server_ip = "192.168.0.36"; // <-- MUDE PARA O IP DO SEU COMPUTADOR
const uint16_t websocket_server_port = 8080;
// --- FIM DAS CONFIGURAÇÕES ---

// Mapeamento de Pinos para os Botões
const int BOTAO_VERDE_PIN = 12;
const int BOTAO_VERMELHO_PIN = 13;
const int BOTAO_AZUL_PIN = 14;
const int BOTAO_AMARELO_PIN = 27;

// Mapeamento de pinos para nomes e cores
struct Botao {
  const int pin;
  const char* cor;
  bool ultimoEstado;
};

Botao botoes[] = {
  {BOTAO_VERDE_PIN, "verde", HIGH},
  {BOTAO_VERMELHO_PIN, "vermelha", HIGH},
  {BOTAO_AZUL_PIN, "azul", HIGH},
  {BOTAO_AMARELO_PIN, "amarela", HIGH}
};

const int NUM_BOTOES = sizeof(botoes) / sizeof(botoes[0]);

// Cliente WebSocket
using namespace websockets;
WebsocketsClient client;

// Protótipo da função
void enviarMensagemWebSocket(const char* cor, const char* estado);

void setup() {
  Serial.begin(115200);
  delay(1000);

  // Configura os pinos dos botões com resistor de pull-up interno
  for (int i = 0; i < NUM_BOTOES; i++) {
    pinMode(botoes[i].pin, INPUT_PULLUP);
  }

  // Conecta ao Wi-Fi
  Serial.print("Conectando ao Wi-Fi: ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi Conectado!");
  Serial.print("Endereço IP: ");
  Serial.println(WiFi.localIP());

  // Conecta ao WebSocket
  String server_url = "ws://" + String(websocket_server_ip) + ":" + String(websocket_server_port);
  Serial.print("Conectando ao servidor WebSocket: ");
  Serial.println(server_url);
  
  bool connected = client.connect(server_url);
  if (connected) {
    Serial.println("Conectado ao WebSocket!");
  } else {
    Serial.println("Falha na conexão com o WebSocket. Reiniciando em 5s...");
    delay(5000);
    ESP.restart();
  }

  // Handler para eventos do WebSocket (opcional)
  client.onMessage([&](WebsocketsMessage message) {
    Serial.print("Mensagem recebida do servidor: ");
    Serial.println(message.data());
  });

  client.onEvent([&](WebsocketsEvent event, String data) {
    if (event == WebsocketsEvent::ConnectionClosed) {
      Serial.println("Conexão WebSocket fechada. Reiniciando...");
      delay(1000);
      ESP.restart();
    }
  });
}

void loop() {
  // Mantém a conexão com o WebSocket
  if (client.available()) {
    client.poll();
  } else {
      Serial.println("WebSocket desconectado. Tentando reconectar...");
      bool connected = client.connect("ws://" + String(websocket_server_ip) + ":" + String(websocket_server_port));
      if (!connected) {
          Serial.println("Reconexão falhou. Reiniciando em 5s...");
          delay(5000);
          ESP.restart();
      } else {
          Serial.println("Reconectado!");
      }
  }

  // Verifica o estado de cada botão
  unsigned long timestamp = millis();
  for (int i = 0; i < NUM_BOTOES; i++) {
    bool estadoAtual = digitalRead(botoes[i].pin);

    // Verifica se houve mudança de estado
    if (estadoAtual != botoes[i].ultimoEstado) {
      // Debounce simples
      delay(50); 
      // Lê novamente para confirmar
      estadoAtual = digitalRead(botoes[i].pin);
      if(estadoAtual == botoes[i].ultimoEstado) continue;


      botoes[i].ultimoEstado = estadoAtual;
      
      // Como usamos INPUT_PULLUP, LOW significa pressionado
      if (estadoAtual == LOW) {
        Serial.printf("Botão %s pressionado\n", botoes[i].cor);
        enviarMensagemWebSocket(botoes[i].cor, "pressionado");
      } else {
        Serial.printf("Botão %s solto\n", botoes[i].cor);
        enviarMensagemWebSocket(botoes[i].cor, "solto");
      }
    }
  }
}

// Função para construir e enviar a mensagem JSON via WebSocket
void enviarMensagemWebSocket(const char* cor, const char* estado) {
  unsigned long timestamp = millis();
  
  // Formato: {"botao":"<cor>","estado":"<estado>","timestamp":<timestamp>}
  String msg = "{\"botao\":\"" + String(cor) + "\",\"estado\":\"" + String(estado) + "\",\"timestamp\":" + String(timestamp) + "}";
  
  Serial.print("Enviando: ");
  Serial.println(msg);
  
  if (client.available()) {
    client.send(msg);
  } else {
    Serial.println("Não foi possível enviar mensagem. WebSocket desconectado.");
  }
}
