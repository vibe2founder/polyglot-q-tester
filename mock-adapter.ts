import { EventEmitter } from 'events';
import type { IAdapter, IMessage } from '../core/index';

export class MockBrokerAdapter extends EventEmitter implements IAdapter {
    name: string;
    connected: boolean = false;
    messages: Map<string, IMessage[]> = new Map();
    publishedHistory: { topic: string, payload: any, timestamp: number }[] = [];

    constructor(name: string = 'mock-broker') {
        super();
        this.name = name;
    }

    async connect(): Promise<void> {
        this.connected = true;
        this.emit('connect');
    }

    async disconnect(): Promise<void> {
        this.connected = false;
        this.emit('disconnect');
    }

    async publish(topic: string, payload: any): Promise<void> {
        this.publishedHistory.push({
            topic,
            payload,
            timestamp: Date.now()
        });

        // Simulate loopback if needed, but primarily record for assertions
        // In a test framework, we might want to manually trigger 'message' to simulate incoming data
    }

    async subscribe(topic: string): Promise<void> {
        // Record subscription
    }

    /**
     * Simulation Helper: Injects a message as if it came from the broker
     */
    simulateIncomingMessage(topic: string, payload: any) {
        const msg: IMessage = {
            id: crypto.randomUUID(),
            topic,
            source: this.name,
            payload,
            timestamp: Date.now(),
            ack: async () => {},
            nack: async () => {}
        };
        this.emit('message', msg);
    }
}
