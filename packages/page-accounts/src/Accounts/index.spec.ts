// Copyright 2017-2021 @polkadot/page-accounts authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { within } from '@testing-library/react';

import i18next from '@polkadot/react-components/i18n';
import { MemoryStore } from '@polkadot/test-support/keyring';
import { keyring } from '@polkadot/ui-keyring';
import { formatBalance } from '@polkadot/util';

import { AccountsPage } from '../../test/pages/accountsPage';

describe('Accounts page', () => {
  let accountsPage: AccountsPage;

  beforeAll(async () => {
    await i18next.changeLanguage('en');
    keyring.loadAll({ isDevelopment: true, store: new MemoryStore() });
  });

  beforeEach(() => {
    accountsPage = new AccountsPage();
  });

  describe('when no accounts', () => {
    it('shows a table', async () => {
      accountsPage.renderPage([]);

      const accountsTable = await accountsPage.findAccountsTable();

      expect(accountsTable).not.toBeNull();
    });

    it('the accounts table contains no account rows', async () => {
      accountsPage.renderPage([]);

      const accountRows = await accountsPage.findAccountRows();

      expect(accountRows).toHaveLength(0);
    });

    it('the accounts table contains a message about no accounts available', async () => {
      accountsPage.renderPage([]);

      const accountsTable = await accountsPage.findAccountsTable();
      const noAccountsMessage = await within(accountsTable).findByText(
        'You don\'t have any accounts. Some features are currently hidden and will only become available once you have accounts.');

      expect(noAccountsMessage).not.toBeNull();
    });
  });

  describe('when some accounts exist', () => {
    it('the accounts table contains some account rows', async () => {
      accountsPage.renderPage([
        { _id: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy', freeBalance: 10000 },
        { _id: '5HGjWAeFDfFCWPsjFQdVV2Msvz2XtMktvgocEZcCj68kUMaw', freeBalance: 999 }
      ]);

      const accountRows = await accountsPage.findAccountRows();

      expect(accountRows).toHaveLength(2);
    });

    it('an account row displays the total balance info', async () => {
      accountsPage.renderPage([
        { _id: '5DAAnrj7VHTznn2AWBemMuyBwZWs6FNFjdyVXUeYum3PTXFy', freeBalance: 10000 }
      ]);
      const rows = await accountsPage.findAccountRows();

      const balance = await within(rows[0]).findByTestId('balance-summary');

      const expectedAmount = '1000000000000'; // = Free + Reserved from mocked APIs
      const expectedText = formatBalance(expectedAmount, { decimals: 12, withUnit: false });

      expect(balance).toHaveTextContent(expectedText);

      // check that we don't compare 0.0000 vs 0.0000 because of rounding
      expect(expectedText).not.toBe(formatBalance('0', { decimals: 12, withUnit: false }));
    });
  });
});