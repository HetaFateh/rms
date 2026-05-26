import { test } from '../../helpers/base.test';
import { login, logout } from '../../helpers/elements/auth.helper';
import { expectSuccessToast } from '../../helpers/elements/global.elements';
import {
  navigateToChannel,
  createChannel,
  editChannel,
  deleteChannel,
  expectChannelVisible,
} from '../../helpers/elements/channel.helper';
import { testToggle } from '../../test.config';
import { TEST_DATA } from '../../helpers/data.helper';

test.describe.serial('Channel Management', () => {
  test.beforeAll(() => {
    if (!testToggle.runChannelManagement) test.skip();
  });

  test('TC-CH-E2E-001 | Create, Edit, and Delete channel', async ({ page }) => {
    const name1 = TEST_DATA.channel.name();
    const code1 = TEST_DATA.channel.code();
    const desc1 = TEST_DATA.channel.desc();

    const name2 = TEST_DATA.channel.name();
    const code2 = TEST_DATA.channel.code();

    await test.step('Admin: Login and navigate to Channel page', async () => {
      await login(page, 'admin');
      await navigateToChannel(page);
    });

    await test.step('Admin: Create new channel', async () => {
      await createChannel(page, name1, code1, desc1);
    });

    await test.step('Admin: Verify success toast after create', async () => {
      await expectSuccessToast(page);
    });

    await test.step('Admin: Verify channel appears in table', async () => {
      await expectChannelVisible(page, name1);
    });

    await test.step('Admin: Edit channel name and code', async () => {
      await editChannel(page, name1, name2, code2);
    });

    await test.step('Admin: Verify success toast after edit', async () => {
      await expectSuccessToast(page);
    });

    await test.step('Admin: Verify updated channel appears in table', async () => {
      await expectChannelVisible(page, name2);
    });

    await test.step('Admin: Delete channel', async () => {
      await deleteChannel(page, name2);
    });

    await test.step('Admin: Verify success toast after delete', async () => {
      await expectSuccessToast(page);
    });

    await test.step('Admin: Logout', async () => {
      await logout(page);
    });
  });
});
