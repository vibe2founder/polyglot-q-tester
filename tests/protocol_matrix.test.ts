import { describe, it } from 'bun:test';
import { TestScenario } from '../index';

const PROTOCOLS = ['redis', 'kafka', 'nats', 'rabbitmq'];

describe('Protocol Matrix: Source -> Target Validation', () => {
    
    // Generate tests for every permutation of Source -> Target
    for (const sourceProto of PROTOCOLS) {
        for (const targetProto of PROTOCOLS) {
            
            it(`should route from ${sourceProto.toUpperCase()} to ${targetProto.toUpperCase()}`, async () => {
                const scenario = new TestScenario();
                const sourceName = `${sourceProto}-src`;
                const targetName = `${targetProto}-target`;

                // Arrange
                await scenario.withAdapter(sourceName);
                await scenario.withAdapter(targetName);
                await scenario.createRoute(sourceName, 'input_channel', targetName, 'output_channel');

                // Act (Simulate Input from Source)
                const payload = { 
                    origin: sourceProto, 
                    dest: targetProto, 
                    ts: Date.now() 
                };
                await scenario.actEmit(sourceName, 'input_channel', payload);

                // Assert (Verify Output on Target)
                // We verify that the Target Mock received the publish call
                await scenario.assertReceived(targetName, 'output_channel', payload);
            });

        }
    }

});

describe('Entry & Exit Data Integrity', () => {
    it('should preserve payload structure exactly across boundaries', async () => {
        const scenario = new TestScenario();
        await scenario.withAdapter('source-heavy');
        await scenario.withAdapter('target-heavy');
        await scenario.createRoute('source-heavy', 'data', 'target-heavy', 'storage');

        const complexPayload = {
            id: 1,
            user: { name: 'Test', roles: ['admin', 'user'] },
            meta: { version: 1.0, flags: [true, false] },
            nullVal: null
        };

        await scenario.actEmit('source-heavy', 'data', complexPayload);
        await scenario.assertReceived('target-heavy', 'storage', complexPayload);
    });
});
