import { expect } from 'chai';
import { safeDump } from 'js-yaml';
import { determineDataType } from './common';

const tests = [{ filename: 'test.png', rawText: '', expectedType: 'unknown' },
    { filename: 'domain.yml', rawText: '', expectedType: 'domain' },
    { filename: 'domain-aa.yaml', rawText: '', expectedType: 'domain' },
    { filename: 'default-domain.yaml', rawText: '', expectedType: 'defaultdomain' },
    { filename: 'default-domain-test.yml', rawText: '', expectedType: 'defaultdomain' },
    { filename: 'config.yml', rawText: '', expectedType: 'rasaconfig' },
    { filename: 'config-oo.yaml', rawText: '', expectedType: 'rasaconfig' },
    { filename: 'bfconfig-hihi.yaml', rawText: '', expectedType: 'bfconfig' },
    { filename: 'bfconfig.yml', rawText: '', expectedType: 'bfconfig' },
    { filename: 'endpoints-ooo.yml', rawText: '', expectedType: 'unknown' },
    { filename: 'endpoints.dev.yaml', rawText: '', expectedType: 'endpoints' },
    { filename: 'endpoints.yaml', rawText: '', expectedType: 'endpoints' },
    { filename: 'credentials.prod.yaml', rawText: '', expectedType: 'credentials' },
    { filename: 'credentials.yaml', rawText: '', expectedType: 'credentials' },
    { filename: 'aaa.json', rawText: 'fwiohfyuweyugfuwyeg', expectedType: 'unknown' },
    { filename: 'aaa.json', rawText: JSON.stringify([{ tracker: ['test'] }]), expectedType: 'conversations' },
    { filename: 'ooo.json', rawText: JSON.stringify([{ text: 'héhé' }]), expectedType: 'incoming' },
    { filename: 'wfwef.yaml', rawText: 'fwiohfyuweyugfuwyeg', expectedType: 'unknown' },
    {
        filename: 'aaaa.yaml',
        rawText: safeDump({
            responses: [], templates: 'est', actions: [], session_config: 'humm', slots: [],
        }),
        expectedType: 'domain',
    },
    {
        filename: 'aaaa.yaml',
        rawText: safeDump({
            responses: [],
        }),
        expectedType: 'domain',
    },
    {
        filename: 'aaaa.yaml',
        rawText: safeDump({
            nlu: [], stories: [], rules: [],
        }),
        expectedType: 'training_data',
    },
    {
        filename: 'aaaa.yaml',
        rawText: safeDump({
            stories: [],
        }),
        expectedType: 'training_data',
    },
    {
        filename: 'aaaa.md',
        rawText: 'ahah',
        expectedType: 'training_data',
    },
    {
        filename: 'aaaa.json',
        rawText: '{}',
        expectedType: 'empty',
    },
    {
        filename: 'aaaa.json',
        rawText: '[]',
        expectedType: 'empty',
    },
    {
        filename: 'aaaa.json',
        rawText: '{"hey": "1"}',
        expectedType: 'training_data',
    },
    {
        filename: 'aaaa.json',
        rawText: '{"hey"}',
        expectedType: 'unknown',
    },
];

if (Meteor.isServer) {
    describe('Inference of files types', () => {
        tests.forEach((test) => {
            const {
                rawText, expectedType, filename,
            } = test;
            
            it(`should mark ${filename} as ${expectedType}`, () => {
                expect(determineDataType({ filename }, rawText)).to.eq(expectedType);
            });
        });
    });
}