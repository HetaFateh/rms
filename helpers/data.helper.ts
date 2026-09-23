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
    email:    'xxx@getnada.com',
    password:     'xxx',
    roleId:       '2',
    asalRegister: '1',
  },
  subscription: {
    searchTerm: 'kv program',
  },
  brand: {
    name: () => `brand${Date.now().toString().slice(-8)}`,
  },
  bank: {
    name: () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      let result = 'bnk';
      for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },
    code: () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let result = 'BNK';
      for (let i = 0; i < 7; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    },
  },
  channel: {
    /** Generates a random lowercase alpha string: 'chn' + 7 letters = 10 chars max. */
    name: () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      let r = 'chn';
      for (let i = 0; i < 7; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
      return r;
    },
    /** Generates a random uppercase alpha string: 'CHN' + 7 letters = 10 chars max. */
    code: () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let r = 'CHN';
      for (let i = 0; i < 7; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
      return r;
    },
    /** Generates a random lowercase alpha string: 'dsc' + 7 letters = 10 chars max. */
    desc: () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      let r = 'dsc';
      for (let i = 0; i < 7; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
      return r;
    },
  },
  kategoriProgram: {
    /** Generates a random lowercase alpha string: 'kp' + 8 letters = 10 chars max. */
    nama: () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      let r = 'kp';
      for (let i = 0; i < 8; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
      return r;
    },
    /** Generates a random lowercase alpha string: 'kpc' + 7 letters = 10 chars max. */
    kode: () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      let r = 'kpc';
      for (let i = 0; i < 7; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
      return r;
    },
    /** Generates a random lowercase alpha string: 'kpd' + 7 letters = 10 chars max. */
    deskripsi: () => {
      const chars = 'abcdefghijklmnopqrstuvwxyz';
      let r = 'kpd';
      for (let i = 0; i < 7; i++) r += chars.charAt(Math.floor(Math.random() * chars.length));
      return r;
    },
  },
  redeem: {
    poin:             '1000',
    minimumPoinRedeem: '500',
    hari:             '2',
    adminFee:         '250',
  },
  imagePath: path.join(__dirname, '../test-assets/promofm.jpg'),
} as const;
