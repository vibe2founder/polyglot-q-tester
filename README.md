# 🧪 Queue Test Kit

> **The Universal Testing Framework for Event-Driven Architectures.**
> Test complex routing, failovers, and latency assertions without spinning up a single Docker container.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Bun Compatible](https://img.shields.io/badge/Bun-%E2%9C%85-black)](https://bun.sh)

---

## 🎯 Por que usar?

Testar sistemas distribuídos é doloroso. Você precisa de Kafka para testar Kafka? Redis para testar Redis? **Não mais.**

O `queue-test-kit` fornece uma camada de abstração que simula o comportamento de brokers reais, permitindo que você valide lógica de negócio, roteamento e resiliência em milissegundos.

---

## 📦 Instalação

```bash
# Via Bun
bun add -D @purecore/queue-test-kit

# Via NPM
npm install --save-dev @purecore/queue-test-kit
```

---

## 🚀 Quick Start

### 1. Criando um Test Scenario
O `TestScenario` é a classe principal que orquestra seus testes.

```typescript
import { TestScenario } from '@purecore/queue-test-kit';

const scenario = new TestScenario();

// Configure seus brokers virtuais
await scenario.withAdapter('redis-source');
await scenario.withAdapter('kafka-target');
```

### 2. Definindo a Lógica (Route)
Diga ao framework como os dados devem fluir.

```typescript
// Redis -> Kafka
await scenario.createRoute('redis-source', 'sensor_data', 'kafka-target', 'analytics_topic');
```

### 3. Executando e Validando (Act & Assert)
Injete dados e verifique se eles chegam onde deveriam.

```typescript
// INJECT: Simula uma mensagem chegando no Redis
await scenario.actEmit('redis-source', 'sensor_data', { temp: 25.5 });

// ASSERT: Verifica se a mensagem foi traduzida e entregue no Kafka
// O framework aguarda (poll) automaticamente até a mensagem chegar ou dar timeout
await scenario.assertReceived('kafka-target', 'analytics_topic', { temp: 25.5 });
```

---

## 🛠️ Funcionalidades Avançadas

### ✅ Deep Match Assertion
Você não precisa validar o objeto inteiro. O `assertReceived` aceita um *partial match*.

```typescript
// Mensagem real: { id: 1, user: { name: 'John', role: 'admin' }, ts: 123456 }
await scenario.assertReceived('target', 'topic', { 
    user: { role: 'admin' } // Passa!
});
```

### ⏱️ Latency Assertion
Verifique se seu sistema está processando rápido o suficiente.

```typescript
// (Feature em desenvolvimento: validação de tempo de entrega)
// await scenario.assertLatency('source', 'target', 50); // máx 50ms
```

### 🎭 Mocking Complexo
O `MockBrokerAdapter` registra todo o histórico. Útil para debugar.

```typescript
const adapter = scenario.getAdapter('kafka-target');
console.log(adapter.publishedHistory); 
// [ { topic: 'analytics', payload: {...}, timestamp: 171... } ]
```

---

## 🤝 Integração com Test Runners

Funciona perfeitamente com **Bun Test**, **Jest**, **Vitest** ou **Mocha**.

**Exemplo com Bun Test:**
```typescript
import { describe, it } from 'bun:test';

describe('Payment Flow', () => {
    it('should process payment', async () => {
        const scenario = new TestScenario();
        // ... setup ...
        await scenario.assertReceived('payments', 'processed', { status: 'PAID' });
    });
});
```

---

## 📝 Licença
MIT © Jean Carlo Nascimento
