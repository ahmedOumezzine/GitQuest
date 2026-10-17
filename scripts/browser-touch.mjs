process.env.GITQUEST_QA_LEVEL ??= 'level-02';
process.env.GITQUEST_QA_TOUCH = '1';
process.env.GITQUEST_QA_WIDTH ??= '390';
process.env.GITQUEST_QA_HEIGHT ??= '844';
await import('./browser-smoke.mjs');
