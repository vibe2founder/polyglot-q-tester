import { QueueTranslator } from '../core/index';
import type { IAdapter } from '../core/index';
import { MockBrokerAdapter } from './mock-adapter';
import { expect } from 'bun:test';

export class TestScenario {
    private translator: QueueTranslator;
    private adapters: Map<string, MockBrokerAdapter> = new Map();

    constructor() {
        this.translator = new QueueTranslator();
    }

    async withAdapter(name: string): Promise<MockBrokerAdapter> {
        const adapter = new MockBrokerAdapter(name);
        this.adapters.set(name, adapter);
        await this.translator.register(adapter);
        return adapter;
    }

    async withRealAdapter(adapter: IAdapter) {
         await this.translator.register(adapter);
    }

    async createRoute(fromSource: string, fromTopic: string, toSource: string, toTopic: string) {
        await this.translator.addRoute(fromSource, fromTopic, toSource, toTopic);
    }

    getAdapter(name: string): MockBrokerAdapter {
        const adapter = this.adapters.get(name);
        if (!adapter) throw new Error(`Adapter ${name} not found in scenario`);
        return adapter;
    }

    async actEmit(sourceName: string, topic: string, payload: any) {
        const adapter = this.getAdapter(sourceName);
        adapter.simulateIncomingMessage(topic, payload);
    }

    async assertReceived(targetName: string, topic: string, partialPayload: any, timeoutMs = 1000) {
        const adapter = this.getAdapter(targetName);
        
        const startTime = Date.now();
        while (Date.now() - startTime < timeoutMs) {
            const match = adapter.publishedHistory.find(msg => 
                msg.topic === topic && 
                this.deepMatch(msg.payload, partialPayload)
            );
            
            if (match) {
                return true; // Pass
            }
            
            await new Promise(r => setTimeout(r, 50));
        }

        throw new Error(`Expected message on ${targetName}/${topic} with payload ${JSON.stringify(partialPayload)} was not received within ${timeoutMs}ms`);
    }

    private deepMatch(actual: any, expected: any): boolean {
        if (typeof expected === 'object' && expected !== null) {
            for (const key in expected) {
                if (!this.deepMatch(actual[key], expected[key])) return false;
            }
            return true;
        }
        return actual === expected;
    }
}
