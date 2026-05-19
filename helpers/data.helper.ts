import path from 'path';

export const TEST_DATA = {
  program: {
    name:             'Test ShareLink',
    code:             'TestShareLink',
    redirectLink:     'www.telkomsel.com',
    maxPoin:          '20',
    budget:           '30',
    thresholdBudget:  '50',
    agentUpline:      '20',
    agentDownline1:   '30',
    thresholdExpired: '2',
    wording:          'Test Automation {produk} & {url}',
    benefit:          'TestAutomationBenefit',
  },
  imagePath: path.join(__dirname, '../test-assets/promofm.jpg'),
} as const;
