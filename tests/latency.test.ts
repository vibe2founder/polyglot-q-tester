import { describe, it, expect } from 'bun:test';
import { TestScenario } from '../index';

describe('Assessment of Latency Assertions', () => {

    it('should pass when latency is within limit', async () => {
        const scenario = new TestScenario();
        const source = 'src';
        const target = 'tgt';
        
        await scenario.withAdapter(source);
        await scenario.withAdapter(target);
        await scenario.createRoute(source, 'in', target, 'out');

        const stimulusTimestamp = await scenario.actEmit(source, 'in', { data: 'test' });
        
        // In-memory should be near instant, so 100ms is plenty
        await scenario.assertLatency(target, 'out', { data: 'test' }, 100, stimulusTimestamp);
    });

    it('should fail when latency exceeds limit', async () => {
        const scenario = new TestScenario();
        const source = 'src';
        const target = 'tgt';
        
        await scenario.withAdapter(source);
        const targetAdapter = await scenario.withAdapter(target);
        await scenario.createRoute(source, 'in', target, 'out');

        const stimulusTimestamp = await scenario.actEmit(source, 'in', { data: 'test' });
        
        // Artificially increase latency by modifying the record
        // Wait for message to arrive first (it's async internally in translator usually)
        await scenario.assertReceived(target, 'out', { data: 'test' });
        
        const lastMsg = targetAdapter.publishedHistory[targetAdapter.publishedHistory.length - 1];
        lastMsg.timestamp = stimulusTimestamp + 200; // Simulated 200ms latency

        // We expect this to fail because we set limit to 100ms
        let error;
        try {
            await scenario.assertLatency(target, 'out', { data: 'test' }, 100, stimulusTimestamp);
        } catch (e: any) {
            error = e;
        }

        expect(error).toBeDefined();
        expect(error.message).toContain('Latency requirement failed');
    });

    it('should use the provided stimulus timestamp correctly', async () => {
        const scenario = new TestScenario();
        const source = 'src';
        const target = 'tgt';
        
        await scenario.withAdapter(source);
        const targetAdapter = await scenario.withAdapter(target);
        await scenario.createRoute(source, 'in', target, 'out');

        // Fake a stimulus time in the past
        const stimulusTimestamp = Date.now() - 1000;
        
        // Emit now
        await scenario.actEmit(source, 'in', { data: 'test' });
        
        // Real latency is ~0, but we compare against stimulusTimestamp (1000ms ago)
        // calculated latency ~ 1000ms.
        // If we assert max 500ms, it should fail.
        
        let error;
        try {
            await scenario.assertLatency(target, 'out', { data: 'test' }, 500, stimulusTimestamp);
        } catch (e: any) {
            error = e;
        }

        expect(error).toBeDefined();
        expect(error.message).toContain('Latency requirement failed');
    });

});
