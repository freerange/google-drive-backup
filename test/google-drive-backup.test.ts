import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import GoogleDriveBackup = require('../lib/google-drive-backup-stack');

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new GoogleDriveBackup.GoogleDriveBackupStack(app, 'MyTestStack');
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});