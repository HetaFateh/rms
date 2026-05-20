/** Test data constants used across the automation suite. */
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
  agent: {
    name:     'Agent Automation Only',
    gender:   'L',
    address:  'Jl. Jend. Sudirman No. 1, Jakarta Pusat',
    cityId:   '491',
    email:    'agentautomationonly@getnada.com',
    password:     'password',
    roleId:       '2',
    asalRegister: '1',
  },
  imagePath: path.join(__dirname, '../test-assets/promofm.jpg'),
} as const;
